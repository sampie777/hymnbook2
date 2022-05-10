import React, { useEffect, useRef } from "react";
import Db from "../../scripts/db/db";
import { SongListModelSchema } from "../../models/SongListModelSchema";
import SongList from "../../scripts/songs/songList";
import Settings from "../../settings";
import { objectToArrayIfNotAlready } from "../../scripts/utils";
import { CollectionChangeCallback } from "realm";
import Animated, { Easing } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  size?: number;
  color?: string;
  style?: object | Array<any>;
}

const SongListMenuIcon: React.FC<Props> = ({ size, color, style }) => {
  const previousSongListSize = useRef(-1);
  const animatedValue = useRef(new Animated.Value<number>(0));
  const animatedStyles = {
    songListIcon: {
      transform: [
        {
          scale: Animated.interpolate(animatedValue.current,
            {
              inputRange: [0, 100],
              outputRange: [1, 4]
            })
        }
      ],
      zIndex: Animated.interpolate(animatedValue.current,
        {
          inputRange: [0, 100],
          outputRange: [0, 100]
        }),
      opacity: Animated.interpolate(animatedValue.current,
        {
          inputRange: [0, 100],
          outputRange: [1, 0.8]
        })
    }
  };

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

    Animated.timing(animatedValue.current, {
      toValue: 100,
      duration: 50,
      easing: Easing.inOut(Easing.ease)
    })
      .start(() =>
        Animated.timing(animatedValue.current, {
          toValue: 0,
          duration: 500,
          easing: Easing.inOut(Easing.ease)
        })
          .start()
      );
  };

  const AnimatedIcon = Animated.createAnimatedComponent(Icon);

  return <AnimatedIcon name="list-ul" size={size} color={color}
                       style={[...objectToArrayIfNotAlready(style), animatedStyles.songListIcon]} />;
};

export default SongListMenuIcon;
