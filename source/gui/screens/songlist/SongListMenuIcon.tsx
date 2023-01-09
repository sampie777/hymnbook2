import React, { useEffect, useRef } from "react";
import Db from "../../../logic/db/db";
import { SongListModelSchema } from "../../../logic/db/models/SongListModelSchema";
import SongList from "../../../logic/songs/songList";
import Settings from "../../../settings";
import { objectToArrayIfNotAlready } from "../../../logic/utils";
import { CollectionChangeCallback } from "realm";
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  size?: number;
  color?: string;
  style?: object | Array<any>;
}

const SongListMenuIcon: React.FC<Props> = ({ size, color, style }) => {
  const previousSongListSize = useRef(-1);
  const animatedValue = useRef(useSharedValue(0));
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(animatedValue.current.value, [0, 100], [1, 4]) }
    ],
    zIndex: interpolate(animatedValue.current.value, [0, 100], [0, 100]),
    opacity: interpolate(animatedValue.current.value, [0, 100], [1, 0.8])
  }));

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    Db.songs.realm().objects(SongListModelSchema.name).addListener(onCollectionChange);
  };

  const onExit = () => {
    Db.songs.realm().objects(SongListModelSchema.name).removeListener(onCollectionChange);
  };

  const onCollectionChange: CollectionChangeCallback<Object> = () => {
    animateSongListChange();

    previousSongListSize.current = SongList.list().length;
  };

  const animateSongListChange = () => {
    if (!Settings.animateAddedToSongList) {
      return;
    }

    if (previousSongListSize.current < 0 || SongList.list().length <= previousSongListSize.current) {
      return;
    }

    animatedValue.current.value = withTiming(100, {
        duration: 50,
        easing: Easing.inOut(Easing.ease)
      }, () =>
        animatedValue.current.value = withTiming(0, {
          duration: 500,
          easing: Easing.inOut(Easing.ease)
        })
    );
  };

  const AnimatedIcon = Animated.createAnimatedComponent(Icon);

  return <AnimatedIcon name="list-ul" size={size} color={color}
                       style={[...objectToArrayIfNotAlready(style), animatedStyle]} />;
};

export default SongListMenuIcon;
