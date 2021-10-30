import React, { useEffect, useRef, useState } from "react";
import { FlatList, StyleSheet, View, ViewToken } from "react-native";
import { Song, Verse, VerseProps } from "../../models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import Db from "../../scripts/db/db";
import LoadingOverlay from "../../components/LoadingOverlay";
import Settings from "../../scripts/settings";
import { GestureEvent, PinchGestureHandler, State } from "react-native-gesture-handler";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import ContentVerse from "./ContentVerse";
import { SongSchema } from "../../models/SongsSchema";
import { keepScreenAwake } from "../../scripts/utils";
import Animated, { Easing } from "react-native-reanimated";
import { PinchGestureHandlerEventPayload } from "react-native-gesture-handler/src/handlers/gestureHandlers";
import SongControls from "./SongControls";
import { routes } from "../../navigation";
import HeaderIconButton from "../../components/HeaderIconButton";
import { generateSongTitle } from "../../scripts/songs/utils";

const Footer: React.FC<{ opacity: Animated.Value<number> }> =
  ({ opacity }) => {
    const animatedStyle = {
      footer: {
        opacity: opacity
      }
    };

    return (<Animated.View style={[styles.footer, animatedStyle.footer]} />);
  };

interface SongDisplayScreenProps {
  route: any;
  navigation: DrawerNavigationProp<any>;
}

const SongDisplayScreen: React.FC<SongDisplayScreenProps> = ({ route, navigation }) => {
  const flatListComponentRef = useRef<FlatList>();
  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const [viewIndex, setViewIndex] = useState(0);
  const animatedScale = new Animated.Value(Settings.songScale);
  const animatedOpacity = new Animated.Value<number>(1);

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
    setTimeout(() => scrollToTop(), 50);
  }, [song?.id]);

  useEffect(() => {
    if (song === undefined) {
      navigation.setOptions({
        title: ""
      });
      return;
    }

    const title = generateSongTitle(song, route.params.selectedVerses);

    navigation.setOptions({
      title: title
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
      title: newSong?.name,
      headerRight: () => (
        <HeaderIconButton icon={"list-ol"} onPress={() => openVersePicker(newSong)} />
      )
    });
  };

  const openVersePicker = (useSong?: Song) => {
    if (useSong === undefined) {
      console.warn("Can't open versepicker for undefined song");
      return;
    }

    const verseParams = useSong?.verses.map(it => {
      return {
        id: it.id,
        name: it.name,
        content: "",
        language: it.language,
        index: it.index
      } as VerseProps;
    });

    navigation.navigate(routes.VersePicker, {
      verses: verseParams,
      selectedVerses: route.params.selectedVerses
    });
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
      <ContentVerse title={item.name}
                    content={item.content}
                    opacity={animatedOpacity}
                    scale={animatedScale} />
    );
  };

  const _onPanGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    animatedScale.setValue(Settings.songScale * event.nativeEvent.scale);
  };

  const _onPinchHandlerStateChange = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      Settings.songScale *= event.nativeEvent.scale;
    }
  };

  const onListViewableItemsChanged = React.useRef(
    ({ viewableItems }: { viewableItems: Array<ViewToken>, changed: Array<ViewToken> }) => {
      if (viewableItems.length === 0) {
        setViewIndex(0);
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

  return (
    <PinchGestureHandler
      onGestureEvent={_onPanGestureEvent}
      onHandlerStateChange={_onPinchHandlerStateChange}>
      <View style={styles.container}>
        <SongControls navigation={navigation}
                      songListIndex={route.params.songListIndex}
                      song={song}
                      listViewIndex={viewIndex}
                      flatListComponentRef={flatListComponentRef.current}
                      selectedVerses={route.params.selectedVerses} />

        <FlatList
          // @ts-ignore
          ref={flatListComponentRef}
          data={(song?.verses as (Realm.Results<Verse> | undefined))?.sorted("index")}
          renderItem={renderContentItem}
          initialNumToRender={20}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.contentSectionList}
          onViewableItemsChanged={onListViewableItemsChanged.current}
          viewabilityConfig={listViewabilityConfig.current}
          onScrollToIndexFailed={(error) => {
            if (song === undefined || error.index < song.verses.length - 1) {
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
  );
};

export default SongDisplayScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch"
  },

  contentSectionList: {
    paddingLeft: 30,
    paddingTop: 20,
    paddingRight: 20,
    paddingBottom: 200
  },

  footer: {
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  }
});
