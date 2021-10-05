import React, { useRef, useState } from "react";
import { BackHandler, FlatList, StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Song, Verse } from "../../models/Songs";
import { useFocusEffect } from "@react-navigation/native";
import Db from "../../scripts/db/db";
import LoadingOverlay from "../../components/LoadingOverlay";
import { routes } from "../../navigation";
import Settings from "../../scripts/settings";
import { GestureEvent, PinchGestureHandler, State } from "react-native-gesture-handler";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { SongListSongModel } from "../../models/SongListModel";
import SongListControls from "./SongListControls";
import ContentVerse from "./ContentVerse";
import { SongSchema } from "../../models/SongsSchema";
import { keepScreenAwake } from "../../scripts/utils";
import { SongVerse } from "../../models/ServerSongsModel";
import Animated  from "react-native-reanimated";
import { PinchGestureHandlerEventPayload } from "react-native-gesture-handler/src/handlers/gestureHandlers";

const Footer: React.FC = () => (
  <View style={styles.footer} />
);

interface SongDisplayScreenProps {
  route: any;
  navigation: DrawerNavigationProp<any>;
}

const SongDisplayScreen: React.FC<SongDisplayScreenProps> = ({ route, navigation }) => {
  const [song, setSong] = useState<Song & Realm.Object | undefined>(undefined);
  const animatedScale = new Animated.Value(Settings.songScale);
  const flatListComponentRef = useRef<FlatList>();

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [route.params.id, route.params.previousScreen])
  );

  const onFocus = () => {
    BackHandler.addEventListener("hardwareBackPress", onBackPress);
    keepScreenAwake(Settings.keepScreenAwake);
    loadSong();
  };

  const onBlur = () => {
    BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    keepScreenAwake(false);
    setSong(undefined);
    navigation.setOptions({ title: "" });
  };

  const onBackPress = (): boolean => {
    if (route.params.previousScreen === undefined) {
      return false;
    }

    navigation.navigate(route.params.previousScreen);
    return true;
  };

  const scrollToTop = () => {
    flatListComponentRef.current?.scrollToOffset({
      offset: 0,
      animated: Settings.scrollToTopAnimated
    });
  };

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
    navigation.setOptions({ title: newSong?.name });
    scrollToTop();
  };

  const renderContentItem = ({ item }: { item: Verse }) => {
    return (
      <ContentVerse title={item.name}
                    content={item.content}
                    scale={animatedScale} />
    );
  };

  const goToSongListSong = (songListSong: SongListSongModel) => {
    navigation.navigate(routes.Song, {
      id: songListSong.song.id,
      previousScreen: routes.SongList,
      songListIndex: songListSong.index
    });
  };

  const _onPanGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    animatedScale.setValue(Settings.songScale * event.nativeEvent.scale)
  }

  const _onPinchHandlerStateChange = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END){
      Settings.songScale *= event.nativeEvent.scale;
    }
  };

  return (
    <PinchGestureHandler
      onGestureEvent={_onPanGestureEvent}
      onHandlerStateChange={_onPinchHandlerStateChange}>
      <View style={styles.container}>
        {route.params.songListIndex === undefined ? undefined :
          <SongListControls index={route.params.songListIndex}
                            goToSongListSong={goToSongListSong} />}

        <FlatList
          // @ts-ignore
          ref={flatListComponentRef}
          data={(song?.verses as (Realm.Results<SongVerse> | undefined))?.sorted("index")}
          renderItem={renderContentItem}
          contentContainerStyle={styles.contentSectionList}
          keyExtractor={item => item.id.toString()}
          ListFooterComponent={<Footer />} />

        <LoadingOverlay text={null}
                        isVisible={
                          route.params.id !== undefined
                          && (song === undefined || song.id !== route.params.id)} />
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
    paddingBottom: 300
  },

  footer: {
    borderTopColor: "#ccc",
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    alignSelf: "center"
  }
});
