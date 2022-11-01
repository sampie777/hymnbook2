import React, { useEffect, useRef, useState } from "react";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  GestureEvent,
  GestureHandlerRootView,
  PinchGestureHandler,
  State
} from "react-native-gesture-handler";
import { PinchGestureHandlerEventPayload } from "react-native-gesture-handler/src/handlers/gestureHandlers";
import ReAnimated, { Easing as ReAnimatedEasing } from "react-native-reanimated";
import { rollbar } from "../../../../logic/rollbar";
import Settings from "../../../../settings";
import { AbcMelody } from "../../../../logic/db/models/AbcMelodies";
import { ParamList, routes, VersePickerMethod } from "../../../../navigation";
import Db from "../../../../logic/db/db";
import { Song, Verse } from "../../../../logic/db/models/Songs";
import {
  calculateVerseHeight,
  generateSongTitle,
  getDefaultMelody,
  loadSongWithId
} from "../../../../logic/songs/utils";
import { keepScreenAwake } from "../../../../logic/utils";
import { Animated, FlatList as NativeFlatList, LayoutChangeEvent } from "react-native";
import { StyleSheet, View, ViewToken } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import LoadingOverlay from "../../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import SongControls from "./SongControls";
import Footer from "./Footer";
import ScreenHeader from "./ScreenHeader";
import MelodySettingsModal from "./melody/MelodySettingsModal";


interface ComponentProps extends NativeStackScreenProps<ParamList, "Song"> {
}

const SongDisplayScreen: React.FC<ComponentProps> = ({ route, navigation }) => {
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>();
  const flatListComponentRef = useRef<FlatList<any>>();
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();
  const verseHeights = useRef<Record<number, number>>({});

  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const [showMelodySettings, setShowMelodySettings] = useState(false);
  const [showMelody, setShowMelody] = useState(false);
  const [showMelodyForAllVerses, setShowMelodyForAllVerses] = useState(Settings.showMelodyForAllVerses);
  const [isMelodyLoading, setIsMelodyLoading] = useState(false);
  const [selectedMelody, setSelectedMelody] = useState<AbcMelody | undefined>(undefined);

  // Use built in Animated, because Reanimated doesn't work with SVGs (react-native-svg)
  const animatedScale = new Animated.Value(Settings.songScale);
  const melodyScale = new Animated.Value(Settings.songMelodyScale);
  // Use Reanimated library, because built in Animated is buggy (animations don't always start)
  const reAnimatedOpacity = new ReAnimated.Value<number>(1);
  const styles = createStyles(useTheme());

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [route.params.id])
  );

  const onFocus = () => {
    keepScreenAwake(Settings.keepScreenAwake);
    loadSong();
  };

  const onBlur = () => {
    keepScreenAwake(false);
    setSong(undefined);
    navigation.setOptions({
      title: "",
      headerRight: undefined
    });
  };

  useEffect(() => {
    verseHeights.current = {};

    if (Settings.songFadeIn) {
      animate();
    } else {
      reAnimatedOpacity.setValue(1);
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
      rollbar.warning("Can't open versepicker for undefined song. route.params.id=" + route.params.id);
      return;
    }

    const verseParams = useSong?.verses.map(it => Verse.toObject(it));

    navigation.navigate(routes.VersePicker, {
      verses: verseParams,
      selectedVerses: route.params.selectedVerses || [],
      songListIndex: route.params.songListIndex,
      method: VersePickerMethod.UpdatePossibleSongListAndGoBackToSong
    });
  };

  const animate = () => {
    reAnimatedOpacity.setValue(0);
    ReAnimated.timing(reAnimatedOpacity, {
      toValue: 1,
      duration: 180,
      easing: ReAnimatedEasing.inOut(ReAnimatedEasing.ease)
    })
      .start();
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

  const delayScrollToFirstVerse = (maxTries = 10) => {
    // Use small timeout for scrollToFirstVerse to prevent scroll being stuck / not firing..
    if (scrollTimeout.current != null) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = undefined;
    }

    if (maxTries <= 0) {
      rollbar.warning(`Max scroll tries elapsed for song '${song?.name}' with verseHeights count: ${verseHeights.current == null ? "isNull" : Object.keys(verseHeights.current).length}`);
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

    flatListComponentRef.current?.scrollToIndex({
      index: scrollIndex || 0,
      animated: Settings.animateScrolling
    });
  };

  const storeVerseHeight = (verse: Verse, event: LayoutChangeEvent) => {
    if (verseHeights.current == null) return;
    verseHeights.current[verse.index] = event.nativeEvent.layout.height;
  };

  const calculateVerseLayout = (data: Array<Verse> | null | undefined, index: number): { length: number; offset: number; index: number } => {
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
                         onLayout={e => storeVerseHeight(item, e)} />;
  };

  const listViewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 10
  });

  const VerseList = Settings.useNativeFlatList ? NativeFlatList : FlatList;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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

      <PinchGestureHandler
        ref={pinchGestureHandlerRef}
        onGestureEvent={_onPanGestureEvent}
        onHandlerStateChange={_onPinchHandlerStateChange}>
        <View style={styles.container}>
          <SongControls navigation={navigation}
                        songListIndex={route.params.songListIndex}
                        song={song}
                        listViewIndex={viewIndex}
                        flatListComponentRef={flatListComponentRef.current}
                        selectedVerses={route.params.selectedVerses} />

          <ReAnimated.View style={[styles.contentSectionListContainer, { opacity: reAnimatedOpacity }]}>
            <VerseList
              // @ts-ignore
              ref={flatListComponentRef}
              waitFor={pinchGestureHandlerRef}
              data={(song?.verses as (Realm.Results<Verse> | undefined))?.sorted("index")}
              renderItem={renderContentItem}
              initialNumToRender={20}
              keyExtractor={(item: Verse) => item.id.toString()}
              getItemLayout={song && song?.verses.length > 20 ? calculateVerseLayout : undefined}
              contentContainerStyle={styles.contentSectionList}
              onViewableItemsChanged={onListViewableItemsChanged.current}
              viewabilityConfig={listViewabilityConfig.current}
              onScrollToIndexFailed={(error) => rollbar.warning(`Failed to scroll to index for song '${song?.name}': ${error}`, error)}
              ListFooterComponent={<Footer song={song} />} />
          </ReAnimated.View>

          <LoadingOverlay text={null}
                          isVisible={
                            route.params.id !== undefined
                            && (song === undefined || song.id !== route.params.id)}
                          animate={Settings.songFadeIn} />
        </View>
      </PinchGestureHandler>
    </GestureHandlerRootView>
  );
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
    paddingRight: 20,
    paddingBottom: 200
  }
});
