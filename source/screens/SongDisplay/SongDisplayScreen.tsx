import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ViewToken } from "react-native";
import { FlatList as NativeFlatList } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  FlatList,
  GestureEvent,
  GestureHandlerRootView,
  PinchGestureHandler,
  State
} from "react-native-gesture-handler";
import { PinchGestureHandlerEventPayload } from "react-native-gesture-handler/src/handlers/gestureHandlers";
import Animated, { Easing } from "react-native-reanimated";
import Db from "../../scripts/db/db";
import Settings from "../../scripts/settings";
import { routes, VersePickerRouteParams } from "../../navigation";
import { SongSchema } from "../../models/SongsSchema";
import { Song, Verse } from "../../models/Songs";
import { generateSongTitle } from "../../scripts/songs/utils";
import { keepScreenAwake } from "../../scripts/utils";
import LoadingOverlay from "../../components/LoadingOverlay";
import ContentVerse from "./ContentVerse";
import SongControls from "./SongControls";
import HeaderIconButton from "../../components/HeaderIconButton";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

const Footer: React.FC<{ opacity: Animated.Value<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = {
      footer: {
        opacity: opacity
      }
    };

    return (<Animated.View style={[styles.footer, animatedStyle.footer]} />);
  };

interface SongDisplayScreenProps {
  route: any;
  navigation: NativeStackNavigationProp<any>;
}

const SongDisplayScreen: React.FC<SongDisplayScreenProps> = ({ route, navigation }) => {
  const flatListComponentRef = useRef<FlatList<any>>();
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();
  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const animatedScale = new Animated.Value(Settings.songScale);
  const animatedOpacity = new Animated.Value<number>(1);
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
      animatedOpacity.setValue(1);
    }

    // Use small timeout for scrollToTop to prevent scroll being stuck / not firing..
    setTimeout(() => scrollToTop(), 150);
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
      headerRight: () => (
        <HeaderIconButton icon={"list-ol"}
                          onPress={() => openVersePicker(song)} />
      )
    });
  }, [song?.name, route.params.selectedVerses]);

  const loadSong = () => {
    if (!Db.songs.isConnected()) {
      return;
    }

    if (route.params.id === undefined) {
      setSong(undefined);
      return;
    }

    const newSong = Db.songs.realm()
      .objectForPrimaryKey(SongSchema.name, route.params.id) as (Song & Realm.Object | undefined);

    if (newSong === undefined) {
      // Song not found
    }

    setSong(newSong);
    navigation.setOptions({
      title: newSong?.name
    });
  };

  const openVersePicker = (useSong?: Song) => {
    if (useSong === undefined) {
      console.warn("Can't open versepicker for undefined song");
      return;
    }

    const verseParams = useSong?.verses.map(it => Verse.toObject(it));

    navigation.navigate(routes.VersePicker, {
      verses: verseParams,
      selectedVerses: route.params.selectedVerses,
      songListIndex: route.params.songListIndex
    } as VersePickerRouteParams);
  };

  const animate = () => {
    animatedOpacity.setValue(0);
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.inOut(Easing.ease)
    })
      .start();
  };

  const renderContentItem = ({ item }: { item: Verse }) => {
    return (
      <ContentVerse verse={item}
                    opacity={animatedOpacity}
                    scale={animatedScale}
                    selectedVerses={route.params.selectedVerses} />
    );
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

  const listViewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50
  });

  const scrollToTop = () => {
    if (song === undefined
      || song?.verses === undefined || song?.verses.length === 0
      || route.params.selectedVerses === undefined || route.params.selectedVerses.length === 0) {
      flatListComponentRef.current?.scrollToOffset({
        offset: 0,
        animated: Settings.animateScrolling
      });
    } else {
      flatListComponentRef.current?.scrollToIndex({
        index: song?.verses.findIndex(it => it.id === route.params.selectedVerses[0].id) || 0,
        animated: Settings.animateScrolling
      });
    }
  };

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

          <VerseList
            // @ts-ignore
            ref={flatListComponentRef}
            waitFor={pinchGestureHandlerRef}
            data={(song?.verses as (Realm.Results<Verse> | undefined))?.sorted("index")}
            renderItem={renderContentItem}
            initialNumToRender={20}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.contentSectionList}
            onViewableItemsChanged={onListViewableItemsChanged.current}
            viewabilityConfig={listViewabilityConfig.current}
            onScrollToIndexFailed={(error) => {
              if (song === undefined || error.index < song.verses.length - 1) {
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
            ListFooterComponent={<Footer opacity={animatedOpacity} />} />

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

  contentSectionList: {
    paddingLeft: 30,
    paddingTop: 5,
    paddingRight: 20,
    paddingBottom: 200
  },

  footer: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  }
});
