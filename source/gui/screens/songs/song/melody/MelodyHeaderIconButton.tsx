import React from "react";
import Settings from "../../../../../settings";
import { Song } from "../../../../../logic/db/models/Songs";
import { hasMelodyToShow } from "../../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  song: Song & Realm.Object;
  showMelody: boolean;
  isMelodyLoading: boolean;
  setShowMelody: (value: boolean) => void;
  setShowMelodySettings: (value: boolean) => void;
}

const MelodyHeaderIconButton: React.FC<Props> = ({
                                                   song,
                                                   showMelody,
                                                   isMelodyLoading,
                                                   setShowMelody,
                                                   setShowMelodySettings
                                                 }) => {
  if (!hasMelodyToShow(song)) return null;

  const styles = createStyles(useTheme());
  const toggleShowMelody = () => requestAnimationFrame(() => setShowMelody(!showMelody));

  if (isMelodyLoading) {
    return <ActivityIndicator size={styles.loadIcon.fontSize}
                              style={styles.loadIcon}
                              color={styles.loadIcon.color} />;
  }

  const shouldShowMelodyCount = song.abcMelodies.length > 1;

  return <TouchableOpacity style={[styles.container, (shouldShowMelodyCount ? {} : styles.containerSingle)]}
                           onPress={() => Settings.longPressForMelodyMenu ? toggleShowMelody() : setShowMelodySettings(true)}
                           onLongPress={() => Settings.longPressForMelodyMenu ? setShowMelodySettings(true) : toggleShowMelody()}
                           hitSlop={{top: 10, right: 0, bottom: 10, left: 10}}>
    <Icon name={"music"} style={styles.icon} />
    {!showMelody ? undefined : <Icon name={"slash"} style={[styles.icon, styles.iconOverlay]} />}

    {/* Show a dot for each available melody (if multiple), maxed at 4 dots/melodies */}
    {!shouldShowMelodyCount ? undefined :
      <View style={styles.countIndicator}>
        {song.abcMelodies.slice(0, 4)
          .map(it => <View key={it.id} style={styles.countIndicatorDot} />)}
      </View>
    }
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  loadIcon: {
    fontSize: 26,
    color: colors.text,
    paddingHorizontal: 7
  },

  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 2,
    width: 44
  },
  containerSingle: {
    paddingBottom: 10,
  },
  icon: {
    fontSize: 20,
    color: colors.text
  },
  iconOverlay: {
    position: "absolute",
    top: 12,
    left: 12
  },
  countIndicator: {
    flexDirection: "row",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    marginTop: 3
  },
  countIndicatorDot: {
    opacity: 0.7,
    borderColor: colors.text,
    borderRadius: 10,
    borderWidth: 1.5,
    width: 0,
    height: 0,
    marginHorizontal: 1.5,
    marginBottom: 2
  }
});

export default MelodyHeaderIconButton;
