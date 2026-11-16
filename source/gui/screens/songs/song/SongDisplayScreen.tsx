import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Gesture, GestureDetector, ScrollView as GestureScrollView } from "react-native-gesture-handler";
import ReAnimated, {
  Easing as ReAnimatedEasing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { rollbar } from "../../../../logic/rollbar";
import Settings from "../../../../settings";
import { AbcMelody, AbcSubMelody } from "../../../../logic/db/models/songs/AbcMelodies";
import { ParamList, SettingsRoute, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import { Song, Verse } from "../../../../logic/db/models/songs/Songs";
import {
  generateSongTitle,
  getDefaultMelody,
  loadSongWithUuidOrId,
  storeLastUsedMelody
} from "../../../../logic/songs/utils";
import { hash, isIOS, keepScreenAwake, sanitizeErrorForRollbar } from "../../../../logic/utils/utils.ts";
import {
  Alert,
  BackHandler,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as NativeScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { useIsMounted } from "../../../components/utils";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import { preloadMelodyFonts } from "../../../components/melody/melodyFonts";
import SongControls from "./SongControls";
import ScreenHeader from "./ScreenHeader";
import SongAudioPopup from "./melody/audiofiles/SongAudioPopup";
import AudioPlayerControls from "./melody/audiofiles/AudioPlayerControls";
import SongList from "../../../../logic/songs/songList";
import { useAppContext } from "../../../components/providers/AppContextProvider";
import { useSongHistory } from "../../../components/providers/SongHistoryProvider";
import MelodySettingsModal from "./melody/MelodySettingsModal.tsx";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";
import SongTextVerses from "./SongTextVerses";
import config from "../../../../config.ts";


interface ComponentProps extends NativeStackScreenProps<ParamList, typeof SongRoute> {
}

const SongDisplayScreen: React.FC<ComponentProps> = ({ route, navigation }) => {
  const isMounted = useIsMounted({ trackFocus: true });
  const fadeInTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const scrollViewComponentRef = useRef<NativeScrollView | GestureScrollView>(null);
  const verseOffsets = useRef<Record<number, number>>({});
  const shouldMelodyShowWhenSongIsLoaded = useRef(false);
  const appContext = useAppContext();
  const history = useSongHistory();

  const [song, setSong] = useState<Song | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const [showSongAudioModal, setShowSongAudioModal] = useState(false);
  const [showMelodySettings, setShowMelodySettings] = useState(false);
  const [showMelody, setShowMelody] = useState(false);
  const [showMelodyForAllVerses, setShowMelodyForAllVerses] = useState(Settings.showMelodyForAllVerses);
  const [showMelodyOnSeparateLines, setShowMelodyOnSeparateLines] = useState(Settings.showMelodyOnSeparateLines);
  const [melodyTextAlignment, setMelodyTextAlignment] = useState(Settings.melodyTextAlignment);
  const [showMelodyChords, setShowMelodyChords] = useState(Settings.showMelodyChords);
  const [isMelodyLoading, setIsMelodyLoading] = useState(false);
  const [selectedMelody, setSelectedMelody] = useState<AbcMelody | undefined>(undefined);
  const [highlightText, setHighlightText] = useState<string | undefined>(route.params.highlightText);
  const { width: windowWidth } = useWindowDimensions();
  const [contentWidth, setContentWidth] = useState(windowWidth - 50);
  const [readyMelodyVerseIds, setReadyMelodyVerseIds] = useState<Set<number>>(new Set());
  const [isHidingMelody, setIsHidingMelody] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    preloadMelodyFonts();
  }, []);

  useEffect(() => {
    if (!isHidingMelody) {
      setReadyMelodyVerseIds(new Set());
    }
  }, [song?.id, selectedMelody?.id, showMelody, showMelodyForAllVerses, showMelodyOnSeparateLines, showMelodyChords, melodyTextAlignment]);


  const baseScale = useSharedValue(Settings.songScale); // Just store the value so it is accesible by the UI thread
  const animatedScale = useSharedValue(Settings.songScale);
  const melodyScale = useSharedValue(Settings.songMelodyScale);
  // Use Reanimated library, because built in Animated is buggy (animations don't always start)
  const animatedOpacity = useSharedValue(Settings.songFadeIn ? 0 : 1);
  const styles = createStyles(useTheme());

  const storeNewScaleValue = (scale: number) => {
    Settings.songScale *= scale;
  }

  const pinchGesture = useMemo(() => Gesture.Pinch()
    .onUpdate((event) => {
      animatedScale.value = baseScale.value * event.scale;
    })
    .onEnd((event) => {
      animatedScale.value = baseScale.value * event.scale;
      baseScale.value = animatedScale.value;
      runOnJS(storeNewScaleValue)(event.scale);
    }), [])

  // For debugging issue #199 only: open settings screen after 3x tap.
  const tapGesture = useMemo(() =>
      Gesture.Tap()
        .enabled(appContext.developerMode)
        .runOnJS(true)
        .numberOfTaps(3)
        .onStart(() => navigation.navigate(SettingsRoute))
    , []);

  useFocusEffect(React.useCallback(() => {
    onFocus();
    return onBlur;
  }, [route.params.id, route.params.uuid]));

  const onFocus = () => {
    keepScreenAwake(Settings.keepScreenAwake);
    loadSong();
  };

  const onBlur = () => {
    keepScreenAwake(false);
    setIsHidingMelody(false);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setSong(undefined);
    history.setSong(undefined);
  };

  useEffect(() => {
    verseOffsets.current = {};
    history.setSong(song);
    history.setSongListItem(SongList.getSongAtIndex(route.params.songListIndex));

    // If song is undefined, we're probably leaving this screen,
    // so we can ignore state and animation updates.
    if (song === undefined) return;

    // Immediately clear old melody so new lyrics aren't paired with old notes
    setSelectedMelody(undefined);

    // Reset this value in case it was temporary changed in handleSetShowMelody()
    setShowMelodyForAllVerses(Settings.showMelodyForAllVerses);

    if (Settings.songFadeIn) {
      animateSongFadeIn();
    }

    setIsMelodyLoading(showMelody);

    // Use a timeout so we can first scroll to the selected verse
    setTimeout(() => {
      // Determine which melody tune to show
      setSelectedMelody(getDefaultMelody(song))
    }, 500);
  }, [song?.id]);

  useEffect(() => {
    if (song == null) return;
    // Wait for the song to be loaded
    if (route.params.id != null && song?.id !== route.params.id) return;
    if (route.params.uuid != null && song?.uuid !== route.params.uuid) return;

    delayScrollToFirstVerse();
  }, [song?.id, route.params.selectedVerses]);

  // Store last used melody in database
  useEffect(() => {
    if (song == null) return;
    if (selectedMelody?.id == song.lastUsedMelody?.id) return;

    try {
      storeLastUsedMelody(song, selectedMelody);
    } catch (error) {
      rollbar.error("Failed to store new lastUsedMelody", {
        ...sanitizeErrorForRollbar(error),
        song: { ...song, verses: null },
        selectedMelody: selectedMelody,
      });
    }
  }, [selectedMelody]);

  useEffect(() => {
    if (!showMelody) return;
    Settings.melodyShowedTimes++;
  }, [showMelody]);

  useFocusEffect(React.useCallback(() => {
    const backHandlerSubscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => backHandlerSubscription.remove();
  }, [highlightText]));

  const onBackPress = (): boolean => {
    if (highlightText != null && highlightText.length > 0) {
      setHighlightText(undefined);
      return true;
    }

    return false;
  };

  React.useLayoutEffect(() => {
    if (song === undefined) {
      navigation.setOptions({
        title: "",
        headerRight: undefined
      });
      return;
    }

    const title = generateSongTitle(song, route.params.selectedVerses);

    navigation.setOptions({
      title: title,
      headerRight: () => <ScreenHeader song={song}
                                       showMelody={showMelody}
                                       setShowMelody={handleSetShowMelody}
                                       setShowSongAudioModal={setShowSongAudioModal}
                                       setShowMelodySettings={setShowMelodySettings}
                                       isMelodyLoading={isMelodyLoading}
                                       openVersePicker={() => openVersePicker(song)} />
    });
  }, [song?.id, route.params.selectedVerses, showMelody, isMelodyLoading]);

  const onMelodyHideComplete = useCallback((verseId: number) => {
    setReadyMelodyVerseIds(prev => {
      const next = new Set(prev);
      next.delete(verseId);
      if (next.size === 0) {
        setIsHidingMelody(false);
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
      }
      return next;
    });
  }, []);

  const willRenderingMelodyBePerformandEnough = (versedToBeRenderedCount: number) =>
    versedToBeRenderedCount < (isIOS ? 60 : 30);

  const handleSetShowMelody = (newValue: boolean) => {
    if (!newValue) {
      if (readyMelodyVerseIds.size > 0) {
        setIsHidingMelody(true);
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = setTimeout(() => {
          setIsHidingMelody(false);
          setReadyMelodyVerseIds(new Set());
        }, config.songs.melody.animationDuration + 200);
      }
      return setShowMelody(false);
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsHidingMelody(false);

    if (!Settings.showMelodyForAllVerses || !song?.verses) {
      return setShowMelody(newValue);
    }

    const versedToBeRenderedCount = route.params.selectedVerses && route.params.selectedVerses.length > 0
      ? route.params.selectedVerses.length
      : song.verses.length;

    if (willRenderingMelodyBePerformandEnough(versedToBeRenderedCount)) {
      return setShowMelody(newValue);
    }

    Alert.alert(
      "Performance Warning",
      `Rendering the melody for all verses of this song might slow down your device significantly. Would you like to temporarly only render the melody for the first verse to improve render speed?`,
      [
        {
          text: "Turn Off",
          onPress: () => {
            setShowMelodyForAllVerses(false);
            setShowMelody(true);
          }
        },
        {
          text: "Keep On",
          style: "cancel",
          onPress: () => setShowMelody(true)
        }
      ]
    );
  };

  const handleSetShowMelodyForAllVerses = (newValue: boolean) => {
    if (!newValue || !showMelody || !song?.verses) {
      return setShowMelodyForAllVerses(newValue);
    }

    const versedToBeRenderedCount = route.params.selectedVerses && route.params.selectedVerses.length > 0
      ? route.params.selectedVerses.length
      : song.verses.length;

    if (willRenderingMelodyBePerformandEnough(versedToBeRenderedCount)) {
      return setShowMelodyForAllVerses(newValue);
    }

    Alert.alert(
      "Performance Warning",
      `Rendering the melody for all verses of this song might slow down your device significantly. Do you still want to turn on "Show melody for all verses"?`,
      [
        {
          text: "Keep Off",
          style: "cancel",
          onPress: () => {
            // Revert the mutation that already occurred inside MelodySettingsModal
            Settings.showMelodyForAllVerses = false;
            setShowMelodyForAllVerses(false);
          }
        },
        {
          text: "Turn On",
          onPress: () => setShowMelodyForAllVerses(true)
        }
      ]
    );
  };

  const loadSong = () => {
    const dbSong = loadSongWithUuidOrId(route.params.uuid, route.params.id);
    setIsHidingMelody(false);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setSong(dbSong ? Song.clone(dbSong, { includeVerses: true }) : undefined);
    history.setSong(song);

    if (!dbSong) {
      Alert.alert("Song could not be found", "This probably happened because the database was updated. Try re-opening the song.")
      rollbar.info("Song could not be found", {
        "route.params.id": route.params.id,
        "route.params.uuid": route.params.uuid,
        isMounted: isMounted(),
        songList: getSongListInformationForErrorReporting()
      })
    }
  };

  const openVersePicker = (useSong?: Song) => {
    if (useSong === undefined) {
      rollbar.warning("Can't open versepicker for undefined song.", {
        "route.params.id": route.params.id,
        "route.params.uuid": route.params.uuid,
        isMounted: isMounted(),
        songList: getSongListInformationForErrorReporting()
      });
      return;
    }

    const verseParams = useSong?.verses.map(it => Verse.toObject(it));

    navigation.navigate(VersePickerRoute, {
      verses: verseParams,
      selectedVerses: route.params.selectedVerses || [],
      songName: song?.name,
      songListIndex: route.params.songListIndex,
      method: VersePickerMethod.UpdatePossibleSongListAndGoBackToSong
    });
  };

  const animateSongFadeIn = () => {
    if (showMelody) {
      // Disable melody while loading new song to improve loading speed
      // Re-enable melody after song is completely loaded.
      shouldMelodyShowWhenSongIsLoaded.current = showMelody;
      setShowMelody(false);
    }

    animatedOpacity.value = 0;

    if (fadeInTimeout.current != null) {
      clearTimeout(fadeInTimeout.current);
      fadeInTimeout.current = undefined;
    }

    if (!isMounted() || song == null) return;

    animatedOpacity.value = withTiming(1, {
      duration: 180,
      easing: ReAnimatedEasing.inOut(ReAnimatedEasing.ease)
    }, () => runOnJS(afterSongFadeIn)());
  };

  const afterSongFadeIn = () => {
    handleSetShowMelody(shouldMelodyShowWhenSongIsLoaded.current);
    shouldMelodyShowWhenSongIsLoaded.current = false;
  };

  const onScrollViewScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    if (!song?.verses || song.verses.length === 0) return;

    // Find the currently visible verse based on recorded offsets
    let currentVerseIndex = 0;
    for (let i = 0; i < song.verses.length; i++) {
      const offset = verseOffsets.current[i] ?? 0;
      if (scrollY >= offset - 50) {
        currentVerseIndex = i;
      }
    }

    setViewIndex(currentVerseIndex);
    history.setIndex(currentVerseIndex);
  };

  // Use small timeout for scrollToFirstVerse to prevent scroll being stuck / not firing..
  const delayScrollToFirstVerse = (maxTries = 20) => {
    if (scrollTimeout.current != null) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = undefined;
    }

    if (!isMounted() || song == null) return;

    if (maxTries <= 0) {
      rollbar.warning("Max scroll tries elapsed.", {
        songName: song?.name ?? "null",
        verseHeights: verseOffsets.current == null ? "null" : Object.keys(verseOffsets.current).length,
        isMounted: isMounted(),
        selectedVerses: route.params.selectedVerses?.map(it => it.name),
        showMelody: showMelody,
        isMelodyLoading: isMelodyLoading,
        viewIndex: viewIndex,
        songList: getSongListInformationForErrorReporting()
      });
      scrollToFirstVerse();
      return;
    }

    // First wait for the verse offsets to be measured
    if (verseOffsets.current == null || Object.keys(verseOffsets.current).length == 0) {
      scrollTimeout.current = setTimeout(() => delayScrollToFirstVerse(maxTries - 1), 200);
      return;
    }

    // Once loaded, scroll to position
    scrollTimeout.current = setTimeout(scrollToFirstVerse, 200);
  };

  const getSongListInformationForErrorReporting = () => {
    try {
      if (route.params.songListIndex != null) {
        return {
          currentIndex: route.params.songListIndex,
          previousSong: SongList.previousSong(route.params.songListIndex)?.song.name,
          nextSong: SongList.nextSong(route.params.songListIndex)?.song.name
        };
      }
    } catch (e) {
      return sanitizeErrorForRollbar(e);
    }
    return undefined;
  };

  const scrollToVerseIndex = (index: number) => {
    const targetOffset = verseOffsets.current[index] ?? 0;
    (scrollViewComponentRef.current as any)?.scrollTo?.({
      y: Math.max(0, targetOffset - 10),
      animated: Settings.animateScrolling
    });
  };

  const scrollToFirstVerse = () => {
    if (!isMounted()) return;

    if (song === undefined
      || song?.verses === undefined || song?.verses.length === 0
      || route.params.selectedVerses === undefined || route.params.selectedVerses.length === 0) {
      (scrollViewComponentRef.current as any)?.scrollTo?.({
        y: 0,
        animated: Settings.animateScrolling
      });
      return;
    }

    const scrollIndex = song.verses.findIndex(it =>
      it.id === route.params.selectedVerses?.[0]?.id ||
      it.index === route.params.selectedVerses?.[0]?.index
    );
    if (scrollIndex == null || scrollIndex < 0) {
      return;
    }

    scrollToVerseIndex(scrollIndex);
  };

  const storeVerseLayout = useCallback((verse: Verse, event: LayoutChangeEvent) => {
    if (verseOffsets.current == null) return;
    verseOffsets.current[verse.index] = event.nativeEvent.layout.y;
  }, []);

  const melodyVerseIds = useMemo(() => {
    const ids = new Set<number>();
    if (!song?.verses || (!showMelody && !isHidingMelody) || !selectedMelody) return ids;

    const shownHashes: string[] = [];
    const selectedVerses = route.params.selectedVerses || [];

    song.verses.forEach((verse) => {
      const isNotSelected = selectedVerses.length > 0 && !selectedVerses.some(it =>
        (it.id != null && it.id === verse.id) || (it.index != null && it.index === verse.index)
      );
      if (isNotSelected) return;

      const noVersesSelectedButAllMustBeShown = showMelodyForAllVerses && selectedVerses.length === 0;
      const verseIsSelectedAndAllMustBeShown = showMelodyForAllVerses && selectedVerses.some(it =>
        (it.id != null && it.id === verse.id) || (it.index != null && it.index === verse.index)
      );
      const isFirstSelectedVerse = selectedVerses.length > 0 &&
        (selectedVerses[0].id === verse.id || selectedVerses[0].index === verse.index);
      const isFirstVerseOfSongWithNoSelectedVerses = selectedVerses.length === 0 && verse.index === 0;

      const melody = AbcSubMelody.getForVerse(selectedMelody, verse)?.melody || selectedMelody.melody;
      const melodyHash = melody ? hash(melody) : null;
      const isUniqueMelody = melodyHash != null && !shownHashes.includes(melodyHash);

      if (!(
        noVersesSelectedButAllMustBeShown ||
        verseIsSelectedAndAllMustBeShown ||
        isFirstSelectedVerse ||
        isFirstVerseOfSongWithNoSelectedVerses ||
        isUniqueMelody
      )) return;

      ids.add(verse.id);
      if (melodyHash) {
        shownHashes.push(melodyHash);
      }
    });

    return ids;
  }, [song?.verses, showMelody, selectedMelody, showMelodyForAllVerses, route.params.selectedVerses]);

  useEffect(() => {
    if (!showMelody || !selectedMelody) {
      setIsMelodyLoading(false);
      return;
    }
    if (melodyVerseIds.size === 0) {
      setIsMelodyLoading(false);
      return;
    }
    const allReady = Array.from(melodyVerseIds).every(id => readyMelodyVerseIds.has(id));
    setIsMelodyLoading(!allReady);
  }, [melodyVerseIds, readyMelodyVerseIds, showMelody, selectedMelody]);


  const renderContentItem = (item: Verse) => {
    const selectedVerses = route.params.selectedVerses || [];

    return <ContentVerse key={item.id.toString()}
                         verse={item}
                         scale={animatedScale}
                         melodyScale={melodyScale}
                         selectedVerses={selectedVerses}
                         activeMelody={selectedMelody}
                         showMelody={showMelody}
                         setIsMelodyLoading={setIsMelodyLoading}
                         onLayout={storeVerseLayout}
                         highlightText={highlightText}
                         showMelodyOnSeparateLines={showMelodyOnSeparateLines}
                         showMelodyChords={showMelodyChords}
                         melodyTextAlignment={melodyTextAlignment}
                         availableWidth={contentWidth}
                         onHideComplete={() => onMelodyHideComplete(item.id)} />;
  };

  const renderVerses = () => {
    if (!song?.verses || song.verses.length === 0) return null;

    const selectedVerses = route.params.selectedVerses || [];

    if (!showMelody && !isHidingMelody) {
      return (
        <SongTextVerses
          verses={song.verses}
          scale={animatedScale}
          selectedVerses={selectedVerses}
          highlightText={highlightText}
          onVerseOffset={(verse, y) => {
            if (verseOffsets.current) verseOffsets.current[verse.index] = y;
          }}
        />
      );
    }

    const elements: React.ReactNode[] = [];
    let textBuffer: Verse[] = [];

    const flushTextBuffer = () => {
      if (textBuffer.length > 0) {
        const chunk = [...textBuffer];
        elements.push(
          <SongTextVerses
            animateLayout={isHidingMelody || isMelodyLoading}
            key={`text_chunk_${chunk[0].id}`}
            verses={chunk}
            scale={animatedScale}
            selectedVerses={selectedVerses}
            highlightText={highlightText}
            onVerseOffset={(verse, y) => {
              if (verseOffsets.current) verseOffsets.current[verse.index] = y;
            }}
          />
        );
        textBuffer = [];
      }
    };

    song.verses.forEach((verse) => {
      if ((showMelody || isHidingMelody) && readyMelodyVerseIds.has(verse.id)) {
        flushTextBuffer();
        elements.push(renderContentItem(verse));
      } else {
        textBuffer.push(verse);
      }
    });

    flushTextBuffer();
    return elements;
  };

  const versesNeedingPreload = useMemo(() => {
    if (!showMelody || !selectedMelody || !song?.verses) return [];
    return song.verses.filter(v => melodyVerseIds.has(v.id) && !readyMelodyVerseIds.has(v.id));
  }, [song?.verses, showMelody, selectedMelody, melodyVerseIds, readyMelodyVerseIds]);

  const ScrollView = Settings.useNativeFlatList ? NativeScrollView : GestureScrollView;

  return <View style={{ flex: 1 }}>
    {!showSongAudioModal || song === undefined ? undefined :
      <SongAudioPopup song={song}
                      selectedMelody={selectedMelody}
                      onClose={() => {
                        if (!isMounted()) return;
                        setShowSongAudioModal(false)
                      }} />
    }

    {!showMelodySettings ? undefined :
      <MelodySettingsModal
        onClose={() => setShowMelodySettings(false)}
        selectedMelody={selectedMelody}
        onMelodySelect={setSelectedMelody}
        melodies={song?.abcMelodies}
        showMelodyForAllVerses={showMelodyForAllVerses}
        setShowMelodyForAllVerses={handleSetShowMelodyForAllVerses}
        showMelodyOnSeparateLines={showMelodyOnSeparateLines}
        setShowMelodyOnSeparateLines={setShowMelodyOnSeparateLines}
        melodyScale={melodyScale}
        melodyTextAlignment={melodyTextAlignment}
        setMelodyTextAlignment={setMelodyTextAlignment} />
    }

    <GestureDetector gesture={pinchGesture}>
      <View style={styles.container}>
        <GestureDetector gesture={tapGesture}>
          <ReAnimated.View
            style={[
              styles.contentSectionListContainer,
              useAnimatedStyle(() => ({ opacity: animatedOpacity.value }))
            ]}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width - 50;
              if (w > 0 && Math.abs(w - contentWidth) > 1) {
                setContentWidth(w);
              }
            }}
          >
            <ScrollView
              ref={scrollViewComponentRef as any}
              contentContainerStyle={styles.contentSectionList}
              onScroll={onScrollViewScroll}
              scrollEventThrottle={100}
              showsVerticalScrollIndicator={true}
              removeClippedSubviews={false}
            >
              <Header song={song} scale={animatedScale} />
              {renderVerses()}
              <Footer song={song} scale={animatedScale} />
            </ScrollView>
          </ReAnimated.View>
        </GestureDetector>

        {versesNeedingPreload.length > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: -9999,
              left: -9999,
              opacity: 0,
              height: 0,
              width: contentWidth,
              overflow: "hidden"
            }}
          >
            {versesNeedingPreload.map(verse => (
              <ContentVerse
                key={`preload_${verse.id}_${selectedMelody?.id}_${Math.round(contentWidth)}`}
                verse={verse}
                scale={animatedScale}
                melodyScale={melodyScale}
                selectedVerses={route.params.selectedVerses || []}
                activeMelody={selectedMelody}
                highlightText={highlightText}
                showMelodyOnSeparateLines={showMelodyOnSeparateLines}
                showMelodyChords={showMelodyChords}
                melodyTextAlignment={melodyTextAlignment}
                availableWidth={contentWidth}
                onMelodyReady={() => {
                  setReadyMelodyVerseIds(prev => {
                    const next = new Set(prev);
                    next.add(verse.id);
                    return next;
                  });
                }}
              />
            ))}
          </View>
        )}

        <LoadingOverlay text={null}
                        isVisible={
                          (route.params.id != undefined && route.params.uuid != undefined)
                          && (song === undefined || (song.id !== route.params.id && song.uuid !== route.params.uuid))}
                        animate={Settings.songFadeIn} />

        <SongControls navigation={navigation}
                      songListIndex={route.params.songListIndex}
                      song={song}
                      listViewIndex={viewIndex}
                      onScrollToVerseIndex={scrollToVerseIndex}
                      selectedVerses={route.params.selectedVerses} />
      </View>
    </GestureDetector>

    {song === undefined ? undefined :
      <AudioPlayerControls song={song}
                           showMelodySettings={() => setShowMelodySettings(true)} />}
  </View>;
};

export default SongDisplayScreen;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  contentSectionListContainer: {
    flex: 1
  },
  contentSectionList: {
    paddingLeft: 30,
    paddingTop: 5,
    paddingRight: 20
  }
});
