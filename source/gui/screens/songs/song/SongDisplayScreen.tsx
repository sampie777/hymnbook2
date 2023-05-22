import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  GestureEvent,
  GestureHandlerRootView,
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
import { AbcMelody } from "../../../../logic/db/models/AbcMelodies";
import { ParamList, SongRoute, VersePickerMethod, VersePickerRoute } from "../../../../navigation";
import Db from "../../../../logic/db/db";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import {
  calculateVerseHeight,
  generateSongTitle,
  getDefaultMelody,
  loadSongWithId
} from "../../../../logic/songs/utils";
import { isIOS, keepScreenAwake } from "../../../../logic/utils";
import { Animated, BackHandler, FlatList as NativeFlatList, LayoutChangeEvent } from "react-native";
import { StyleSheet, View, ViewToken } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import SongControls from "./SongControls";
import Footer from "./Footer";
import ScreenHeader from "./ScreenHeader";
import MelodySettingsModal from "./melody/MelodySettingsModal";
import MelodyHelpModal from "./melody/MelodyHelpModal";


interface ComponentProps extends NativeStackScreenProps<ParamList, typeof SongRoute> {
}

const SongDisplayScreen: React.FC<ComponentProps> = ({ route, navigation }) => {
  const isMounted = useRef(true);
  const _isFocused = useRef(false); // todo: Temporary value to analyze "Failed to scroll to index" cause
  const fadeInTimeout = useRef<NodeJS.Timeout | undefined>();
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>();
  const flatListComponentRef = useRef<FlatList<Verse>>(null);
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();
  const verseHeights = useRef<Record<number, number>>({});
  const shouldMelodyShowWhenSongIsLoaded = useRef(false);

  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const [showMelodySettings, setShowMelodySettings] = useState(false);
  const [showMelodyHelp, setShowMelodyHelp] = useState(false);
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

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [route.params.id])
  );

  const onFocus = () => {
    isMounted.current = true;
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

    if (Settings.melodyShowedTimes == 0) {
      setShowMelodyHelp(true);
    }

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
                                       setShowMelodySettings={setShowMelodySettings}
                                       isMelodyLoading={isMelodyLoading}
                                       openVersePicker={() => openVersePicker(song)} />
    });
  }, [song?.id, route.params.selectedVerses, showMelody, isMelodyLoading]);

  const loadSong = () => {
    setSong(loadSongWithId(route.params.id));
  };

  const openVersePicker = (useSong?: Song) => {
    if (useSong === undefined) {
      rollbar.warning("Can't open versepicker for undefined song.", {
        "route.params.id": route.params.id,
        isMounted: isMounted.current,
        isFocused: _isFocused.current
      });
      return;
    }

    const verseParams = useSong?.verses.map(it => Verse.toObject(it));

    navigation.navigate(VersePickerRoute, {
      verses: verseParams,
      selectedVerses: route.params.selectedVerses || [],
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

    if (!isMounted.current || song == null) return;

    if (maxTries > 0 && (verseHeights.current == null || Object.keys(verseHeights.current).length == 0)) {
      // Wait for the verses to load before fading song in, otherwise the screen will look glitchy.
      fadeInTimeout.current = setTimeout(() => animateSongFadeIn(maxTries - 1), 10);
      return;
    }

    if (maxTries <= 0) {
      rollbar.warning("Max song load animation tries elapsed", {
        songName: song?.name ?? "null",
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted.current,
        maxTries: maxTries,
        SettingsSongFadeIn: Settings.songFadeIn,
        showMelody: showMelody,
        isMelodyLoading: isMelodyLoading,
        viewIndex: viewIndex,
        isFocused: _isFocused.current
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
    setViewIndex((song?.verses?.length ?? 0) - 1);
  };

  // Use small timeout for scrollToFirstVerse to prevent scroll being stuck / not firing..
  const delayScrollToFirstVerse = (maxTries = 20) => {
    if (scrollTimeout.current != null) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = undefined;
    }

    if (!isMounted.current || song == null) return;

    if (maxTries <= 0) {
      rollbar.warning("Max scroll tries elapsed.", {
        songName: song?.name ?? "null",
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted.current,
        selectedVerses: route.params.selectedVerses?.map(it => it.name),
        showMelody: showMelody,
        isMelodyLoading: isMelodyLoading,
        viewIndex: viewIndex,
        isFocused: _isFocused.current
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

  const scrollToFirstVerse = () => {
    if (!isMounted.current) return;

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
    } catch (e: any) {
      rollbar.warning(`Failed to scroll to index: ${e}`, {
        error: e,
        scrollIndex: scrollIndex,
        songName: song?.name ?? "null",
        verseHeights: verseHeights.current == null ? "null" : Object.keys(verseHeights.current).length,
        isMounted: isMounted.current,
        selectedVerses: route.params.selectedVerses?.map(it => it.name),
        isFocused: _isFocused.current
      });
    }
  };

  const storeVerseHeight = (verse: Verse, event: LayoutChangeEvent) => {
    if (verseHeights.current == null) return;
    verseHeights.current[verse.index] = event.nativeEvent.layout.height;
  };

  const calculateVerseLayout = (data: Array<Verse> | null | undefined, index: number): {
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

  const renderContentItem = ({ item }: { item: Verse }) => {
    const selectedVerses = route.params.selectedVerses || [];

    // Show melody if verse is part of (all) selected verses
    const noVersesSelectedButAllMustBeShown = showMelodyForAllVerses && selectedVerses.length === 0;
    const verseIsSelectedAndAllMustBeShown = showMelodyForAllVerses && selectedVerses.some(it => it.id == item.id);
    // Show melody because it's first selected verse
    const isVerseSelectedVerse = selectedVerses.length > 0 && selectedVerses[0].id == item.id;
    // Show melody because it's first verse of song
    const isFirstVerseOfSongWithNoSelectedVerses = selectedVerses.length === 0 && item.index === 0;

    const shouldMelodyBeShownForVerse = showMelody && (noVersesSelectedButAllMustBeShown || verseIsSelectedAndAllMustBeShown || isVerseSelectedVerse || isFirstVerseOfSongWithNoSelectedVerses);

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

  return <GestureHandlerRootView style={{ flex: 1 }}>
    {!showMelodySettings ? undefined :
      <MelodySettingsModal
        isMelodyShown={showMelody}
        enableMelody={setShowMelody}
        onClose={() => setShowMelodySettings(false)}
        selectedMelody={selectedMelody}
        onMelodySelect={setSelectedMelody}
        melodies={song?.abcMelodies}
        showMelodyForAllVerses={showMelodyForAllVerses}
        setShowMelodyForAllVerses={setShowMelodyForAllVerses}
        melodyScale={melodyScale} />}

    {!showMelodyHelp || showMelodySettings ? undefined :
      <MelodyHelpModal onClose={() => setShowMelodyHelp(false)} />}

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

        <ReAnimated.View style={[
          styles.contentSectionListContainer,
          useAnimatedStyle(() => ({ opacity: reAnimatedOpacity.value }))
        ]}>
          <VerseList
            ref={flatListComponentRef}
            waitFor={isIOS ? undefined : pinchGestureHandlerRef}
            data={(song?.verses as (Realm.Results<Verse> | undefined))?.sorted("index")}
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
              isMounted: isMounted.current,
              viewIndex: viewIndex,
              selectedVerses: route.params.selectedVerses?.map(it => it.name),
              isFocused: _isFocused.current
            })}
            ListFooterComponent={<Footer song={song} />} />
        </ReAnimated.View>

        <LoadingOverlay text={null}
                        isVisible={
                          route.params.id !== undefined
                          && (song === undefined || song.id !== route.params.id)}
                        animate={Settings.songFadeIn} />
      </View>
    </PinchGestureHandler>
  </GestureHandlerRootView>;
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
