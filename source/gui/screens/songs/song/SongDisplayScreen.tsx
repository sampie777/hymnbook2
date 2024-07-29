import React, { useEffect, useMemo, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList, Gesture, GestureDetector,
  GestureEvent,
  PinchGestureHandler, PinchGestureHandlerEventPayload,
  State
} from "react-native-gesture-handler";
import ReAnimated, {
  Easing as ReAnimatedEasing, runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { rollbar } from "../../../../logic/rollbar";
import Settings from "../../../../settings";
import { AbcMelody, AbcSubMelody } from "../../../../logic/db/models/AbcMelodies";
import { ParamList, SettingsRoute, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import Db from "../../../../logic/db/db";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import {
  calculateVerseHeight,
  generateSongTitle,
  getDefaultMelody,
  loadSongWithUuidOrId
} from "../../../../logic/songs/utils";
import { hash, isIOS, keepScreenAwake, sanitizeErrorForRollbar } from "../../../../logic/utils";
import { Alert, Animated, BackHandler, FlatList as NativeFlatList, LayoutChangeEvent } from "react-native";
import { StyleSheet, View, ViewToken } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { useIsMounted } from "../../../components/utils";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import SongControls from "./SongControls";
import Footer from "./Footer";
import ScreenHeader from "./ScreenHeader";
import MelodySettingsModal from "./melody/MelodySettingsModal";
import Header from "./Header";
import SongAudioPopup from "./melody/audiofiles/SongAudioPopup";
import AudioPlayerControls from "./melody/audiofiles/AudioPlayerControls";
import SongList from "../../../../logic/songs/songList";
import { useAppContext } from "../../../components/providers/AppContextProvider";


interface ComponentProps extends NativeStackScreenProps<ParamList, typeof SongRoute> {
}

const SongDisplayScreen: React.FC<ComponentProps> = ({ route, navigation }) => {
  const isMounted = useIsMounted({ trackFocus: true });
  const _isFocused = useRef(false); // todo: Temporary value to analyze "Failed to scroll to index" cause
  const fadeInTimeout = useRef<NodeJS.Timeout | undefined>();
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>();
  const flatListComponentRef = useRef<FlatList<Verse>>(null);
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();
  const verseHeights = useRef<Record<number, number>>({});
  const shouldMelodyShowWhenSongIsLoaded = useRef(false);
  const shownMelodyHashes: (string | null)[] = [];
  const appContext = useAppContext();

  const [song, setSong] = useState<Song | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const [showSongAudioModal, setShowSongAudioModal] = useState(false);
  const [showMelodySettings, setShowMelodySettings] = useState(false);
  const [showMelody, setShowMelody] = useState(false);
  const [showMelodyForAllVerses, setShowMelodyForAllVerses] = useState(Settings.showMelodyForAllVerses);
  const [isMelodyLoading, setIsMelodyLoading] = useState(false);
  const [selectedMelody, setSelectedMelody] = useState<AbcMelody | undefined>(undefined);
  const [highlightText, setHighlightText] = useState<string | undefined>(route.params.highlightText);

  // Use built in Animated, because Reanimated doesn't work with SVGs (react-native-svg)
  const animatedScale = new Animated.Value(Settings.songScale);
  const melodyScale = new Animated.Value(Settings.songMelodyScale);
  // Use Reanimated library, because built in Animated is buggy (animations don't always start)
  const reAnimatedOpacity = useSharedValue(Settings.songFadeIn ? 0 : 1);
  const styles = createStyles(useTheme());

  // For debugging issue #199 only: open settings screen after 3x tap.
  const tapGesture = useMemo(() =>
      Gesture.Tap()
        .enabled(appContext.developerMode)
        .runOnJS(true)
        .numberOfTaps(3)
        .onStart(() => navigation.navigate(SettingsRoute))
    , []);

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [route.params.id, route.params.uuid])
  );

  const onFocus = () => {
    _isFocused.current = true;
    keepScreenAwake(Settings.keepScreenAwake);
    loadSong();
  };

  const onBlur = () => {
    _isFocused.current = false;
    keepScreenAwake(false);
    setSong(undefined);
  };

  useEffect(() => {
    verseHeights.current = {};

    // If song is undefined, we're probably leaving this screen,
    // so we can ignore state and animation updates.
    if (song === undefined) return;

    if (Settings.songFadeIn) {
      animateSongFadeIn();
    }

    // Determine which melody tune to show
    setSelectedMelody(getDefaultMelody(song));
  }, [song?.id]);

  useEffect(() => {
    delayScrollToFirstVerse();
  }, [song?.id, route.params.selectedVerses]);

  // Store last used melody in database
  useEffect(() => {
    if (song == null) return;
    if (selectedMelody?.id == song.lastUsedMelody?.id) return;

    Db.songs.realm().write(() => {
      song.lastUsedMelody = selectedMelody;
    });
  }, [selectedMelody]);

  useEffect(() => {
    if (!showMelody) return;
    Settings.melodyShowedTimes++;
  }, [showMelody]);

  useFocusEffect(React.useCallback(() => {
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBackPress);
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
                                       setShowMelody={setShowMelody}
                                       setShowSongAudioModal={setShowSongAudioModal}
                                       setShowMelodySettings={setShowMelodySettings}
                                       isMelodyLoading={isMelodyLoading}
                                       openVersePicker={() => openVersePicker(song)} />
    });
  }, [song?.id, route.params.selectedVerses, showMelody, isMelodyLoading]);

  const loadSong = () => {
    const dbSong = loadSongWithUuidOrId(route.params.uuid, route.params.id);
    setSong(dbSong ? Song.clone(dbSong) : undefined);

    if (!dbSong) {
      Alert.alert("Song could not be found", "This probably happened because the database was updated. Try re-opening the song.")
      rollbar.info("Song could not be found", {
        "route.params.id": route.params.id,
        "route.params.uuid": route.params.uuid,
        isMounted: isMounted(),
        isFocused: _isFocused.current,
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
        isFocused: _isFocused.current,
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

  const animateSongFadeIn = (maxTries = 10) => {
    if (showMelody) {
      // Disable melody while loading new song to improve loading speed
      // Re-enable melody after song is completely loaded.
      shouldMelodyShowWhenSongIsLoaded.current = showMelody;
      setShowMelody(false);
    }

    reAnimatedOpacity.value = 0;

    if (fadeInTimeout.current != null) {
      clearTimeout(fadeInTimeout.current);
      fadeInTimeout.current = undefined;
    }

    if (!isMounted() || song == null) return;

    if (maxTries > 0 && (verseHeights.current == null || Object.keys(verseHeights.current).length == 0)) {
      // Wait for the verses to load before fading song in, otherwise the screen will look glitchy.
      fadeInTimeout.current = setTimeout(() => animateSongFadeIn(maxTries - 1), 10);
      return;
    }

    if (maxTries <= 0) {
      rollbar.warning("Max song load animation tries elapsed", {
        songName: song?.name ?? "null",
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted(),
        maxTries: maxTries,
        SettingsSongFadeIn: Settings.songFadeIn,
        showMelody: showMelody,
        isMelodyLoading: isMelodyLoading,
        viewIndex: viewIndex,
        isFocused: _isFocused.current,
        songList: getSongListInformationForErrorReporting()
      });
    }

    reAnimatedOpacity.value = withTiming(1, {
      duration: 180,
      easing: ReAnimatedEasing.inOut(ReAnimatedEasing.ease)
    }, () => runOnJS(afterSongFadeIn)());
  };

  const afterSongFadeIn = () => {
    setShowMelody(shouldMelodyShowWhenSongIsLoaded.current);
    shouldMelodyShowWhenSongIsLoaded.current = false;
  };

  const _onPanGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    animatedScale.setValue(Settings.songScale * event.nativeEvent.scale);
  };

  const _onPinchHandlerStateChange = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      verseHeights.current = {};
      animatedScale.setValue(Settings.songScale * event.nativeEvent.scale);
      Settings.songScale *= event.nativeEvent.scale;
    }
  };

  const onListViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken>, changed: Array<ViewToken> }) => {
      if (viewableItems.length === 0) {
        setViewIndex(-1);
      } else if (viewableItems[0].index !== null) {
        setViewIndex(viewableItems[0].index);
      }
    });

  const onListEndReached = () => {
    if (!isMounted()) return;
    setViewIndex((song?.verses?.length ?? 0) - 1);
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
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted(),
        selectedVerses: route.params.selectedVerses?.map(it => it.name),
        showMelody: showMelody,
        isMelodyLoading: isMelodyLoading,
        viewIndex: viewIndex,
        isFocused: _isFocused.current,
        songList: getSongListInformationForErrorReporting()
      });
      scrollToFirstVerse();
      return;
    }

    // First wait for the verses to be loaded
    if (verseHeights.current == null || Object.keys(verseHeights.current).length == 0) {
      scrollTimeout.current = setTimeout(() => delayScrollToFirstVerse(maxTries - 1), 200);
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

  const scrollToFirstVerse = () => {
    if (!isMounted()) return;

    if (song === undefined
      || song?.verses === undefined || song?.verses.length === 0
      || route.params.selectedVerses === undefined || route.params.selectedVerses.length === 0) {
      flatListComponentRef.current?.scrollToOffset({
        offset: 0,
        animated: Settings.animateScrolling
      });
      return;
    }

    const scrollIndex = song.verses.findIndex(it => it.id === route.params.selectedVerses!![0].id);
    if (scrollIndex == null || scrollIndex < 0) {
      return;
    }

    try {
      flatListComponentRef.current?.scrollToIndex({
        index: scrollIndex || 0,
        animated: Settings.animateScrolling
      });
    } catch (error) {
      rollbar.warning(`Failed to scroll to index`, {
        ...sanitizeErrorForRollbar(error),
        scrollIndex: scrollIndex,
        songName: song?.name ?? "null",
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted(),
        selectedVerses: route.params.selectedVerses?.map(it => it.name),
        isFocused: _isFocused.current,
        songList: getSongListInformationForErrorReporting()
      });
    }
  };

  const storeVerseHeight = (verse: Verse, event: LayoutChangeEvent) => {
    if (verseHeights.current == null) return;
    verseHeights.current[verse.index] = event.nativeEvent.layout.height;
  };

  const calculateVerseLayout = (data: ArrayLike<Verse> | null | undefined, index: number): {
    length: number;
    offset: number;
    index: number
  } => {
    if (data == null || data.length == 0 || verseHeights.current == null) {
      return {
        length: 0,
        offset: 0,
        index: 0
      };
    }

    return calculateVerseHeight(index, verseHeights.current);
  };

  // When verse is shown (either no verses as selected or this verse selected no matter if its first or not)
  // and the verse custom melody isn't shown yet
  const isVerseVisibleAndHasUniqueMelody = (verse: Verse, selectedVerses: Verse[]): boolean => {
    if (!selectedMelody) return false;

    const isNotSelectedVerse = selectedVerses.length > 0 && !selectedVerses.some(it => it.id === verse.id);
    if (isNotSelectedVerse) return false;

    const melody = AbcSubMelody.getForVerse(selectedMelody, verse)?.melody || selectedMelody.melody;
    if (!melody) return false;

    const melodyHash = hash(melody);
    if(shownMelodyHashes.includes(melodyHash)) return false;

    shownMelodyHashes.push(melodyHash);
    return true;
  };

  const renderContentItem = ({ item }: { item: Verse }) => {
    const selectedVerses = route.params.selectedVerses || [];

    // Show melody if verse is part of (all) selected verses
    const noVersesSelectedButAllMustBeShown = showMelodyForAllVerses && selectedVerses.length === 0;
    const verseIsSelectedAndAllMustBeShown = showMelodyForAllVerses && selectedVerses.some(it => it.id == item.id);
    // Show melody because it's first selected verse
    const isFirstSelectedVerse = selectedVerses.length > 0 && selectedVerses[0].id == item.id;
    // Show melody because it's first verse of song
    const isFirstVerseOfSongWithNoSelectedVerses = selectedVerses.length === 0 && item.index === 0;

    // Do the variable assignment here, so the function `isVerseVisibleAndHasUniqueMelody()` will always run, as it keeps track of `shownMelodyHashes`.
    const verseIsVisibleAndHasUniqueMelody = isVerseVisibleAndHasUniqueMelody(item, selectedVerses);

    const shouldMelodyBeShownForVerse = showMelody
      && (noVersesSelectedButAllMustBeShown
        || verseIsSelectedAndAllMustBeShown
        || isFirstSelectedVerse
        || isFirstVerseOfSongWithNoSelectedVerses
        || verseIsVisibleAndHasUniqueMelody);

    return <ContentVerse verse={item}
                         scale={animatedScale}
                         melodyScale={melodyScale}
                         selectedVerses={selectedVerses}
                         activeMelody={!shouldMelodyBeShownForVerse ? undefined : selectedMelody}
                         setIsMelodyLoading={setIsMelodyLoading}
                         onLayout={e => storeVerseHeight(item, e)}
                         highlightText={highlightText} />;
  };

  const listViewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 10
  });

  // With NativeFlatList, pinch-to-zoom won't work properly on Android
  const VerseList = Settings.useNativeFlatList ? NativeFlatList : FlatList;

  return <View style={{ flex: 1 }}>
    {!showSongAudioModal || song === undefined ? undefined :
      <SongAudioPopup song={song}
                      selectedMelody={selectedMelody}
                      onClose={() => {
                        if (!isMounted()) return;
                        setShowSongAudioModal(false)
                      }} />}

    {!showMelodySettings ? undefined :
      <MelodySettingsModal
        onClose={() => setShowMelodySettings(false)}
        selectedMelody={selectedMelody}
        onMelodySelect={setSelectedMelody}
        melodies={song?.abcMelodies}
        showMelodyForAllVerses={showMelodyForAllVerses}
        setShowMelodyForAllVerses={setShowMelodyForAllVerses}
        melodyScale={melodyScale} />}

    <PinchGestureHandler
      ref={pinchGestureHandlerRef}
      onGestureEvent={_onPanGestureEvent}
      onHandlerStateChange={_onPinchHandlerStateChange}>
      <View style={styles.container}>
        <SongControls navigation={navigation}
                      songListIndex={route.params.songListIndex}
                      song={song}
                      listViewIndex={viewIndex}
                      flatListComponentRef={flatListComponentRef.current || undefined}
                      selectedVerses={route.params.selectedVerses} />

        <GestureDetector gesture={tapGesture}>
          <ReAnimated.View style={[
            styles.contentSectionListContainer,
            useAnimatedStyle(() => ({ opacity: reAnimatedOpacity.value }))
          ]}>
            <VerseList
              ref={flatListComponentRef}
              waitFor={isIOS ? undefined : pinchGestureHandlerRef}
              data={song?.verses}
              renderItem={renderContentItem}
              initialNumToRender={20}
              keyExtractor={(item: Verse) => item.id.toString()}
              getItemLayout={song && song?.verses.length > 20 ? calculateVerseLayout : undefined}
              contentContainerStyle={styles.contentSectionList}
              onViewableItemsChanged={onListViewableItemsChanged.current}
              viewabilityConfig={listViewabilityConfig.current}
              onEndReached={onListEndReached}
              onScrollToIndexFailed={(info) => rollbar.warning("Failed to scroll to index.", {
                info: info,
                songName: song?.name ?? "null",
                verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
                isMounted: isMounted(),
                viewIndex: viewIndex,
                selectedVerses: route.params.selectedVerses?.map(it => it.name),
                isFocused: _isFocused.current,
                songList: getSongListInformationForErrorReporting()
              })}
              ListHeaderComponent={<Header song={song} scale={animatedScale} />}
              ListFooterComponent={<Footer song={song} scale={animatedScale} />}
              removeClippedSubviews={false} // Set this to false to enable text selection. Work around can be: https://stackoverflow.com/a/62936447/2806723
            />
          </ReAnimated.View>
        </GestureDetector>

        <LoadingOverlay text={null}
                        isVisible={
                          (route.params.id != undefined && route.params.uuid != undefined)
                          && (song === undefined || (song.id !== route.params.id && song.uuid !== route.params.uuid))}
                        animate={Settings.songFadeIn} />
      </View>
    </PinchGestureHandler>

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
