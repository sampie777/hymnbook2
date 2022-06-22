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
import { rollbar } from "../../../logic/rollbar";
import Settings from "../../../settings";
import { ParamList, routes, VersePickerMethod } from "../../../navigation";
import { Song, Verse } from "../../../logic/db/models/Songs";
import { generateSongTitle, loadSongWithId } from "../../../logic/songs/utils";
import { keepScreenAwake } from "../../../logic/utils";
import { Animated, FlatList as NativeFlatList } from "react-native";
import { StyleSheet, View, ViewToken } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import LoadingOverlay from "../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import SongControls from "./SongControls";
import Footer from "./Footer";
import ScreenHeader from "./ScreenHeader";


interface ComponentProps extends NativeStackScreenProps<ParamList, "Song"> {
}

const SongDisplayScreen: React.FC<ComponentProps> = ({ route, navigation }) => {
  const scrollTimeout = useRef<NodeJS.Timeout | undefined>();
  const flatListComponentRef = useRef<FlatList<any>>();
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();

  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const [showMelody, setShowMelody] = useState(false);
  const [isMelodyLoading, setIsMelodyLoading] = useState(false);

  // Use built in Animated, because Reanimated doesn't work with SVGs (react-native-svg)
  const animatedScale = new Animated.Value(Settings.songScale);
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
    if (Settings.songFadeIn) {
      animate();
    } else {
      reAnimatedOpacity.setValue(1);
    }

    // Use small timeout for scrollToTop to prevent scroll being stuck / not firing..
    if (scrollTimeout.current != null) {
      clearTimeout(scrollTimeout.current);
      scrollTimeout.current = undefined;
    }
    scrollTimeout.current = setTimeout(() => scrollToTop(), 500);
  }, [song?.id]);

  useEffect(() => {
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
                                       isMelodyLoading={isMelodyLoading}
                                       openVersePicker={() => openVersePicker(song)} />
    });
  }, [song?.name, route.params.selectedVerses, showMelody, isMelodyLoading]);

  const loadSong = () => {
    const newSong = loadSongWithId(route.params.id);
    setSong(newSong);

    if (newSong !== undefined) {
      navigation.setOptions({ title: newSong?.name });
    }
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

  const scrollToTop = () => {
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

  const activeMelody = !showMelody || song === undefined
  || !song.abcMelodies || song.abcMelodies.length === 0 ? undefined : song.abcMelodies[0];

  const renderContentItem = ({ item }: { item: Verse }) => {
    return (
      <ContentVerse verse={item}
                    scale={animatedScale}
                    selectedVerses={route.params.selectedVerses || []}
                    activeMelody={activeMelody}
                    setIsMelodyLoading={setIsMelodyLoading} />
    );
  };

  const listViewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 10
  });

  const VerseList = Settings.useNativeFlatList ? NativeFlatList : FlatList;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
              contentContainerStyle={styles.contentSectionList}
              onViewableItemsChanged={onListViewableItemsChanged.current}
              viewabilityConfig={listViewabilityConfig.current}
              onScrollToIndexFailed={(error) => {
                if (song !== undefined && error.index < song.verses.length - 1) {
                  // todo: Temp fix
                  flatListComponentRef.current?.scrollToIndex({
                    index: error.index / 2,
                    animated: Settings.animateScrolling
                  });
                  return;
                }

                flatListComponentRef.current?.scrollToEnd({
                  animated: Settings.animateScrolling
                });
              }}
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
