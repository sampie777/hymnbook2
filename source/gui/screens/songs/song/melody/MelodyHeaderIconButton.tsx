import React from "react";
import { Song } from "../../../../../logic/db/models/songs/Songs";
import { hasMelodyToShow } from "../../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Menu, MenuOption, MenuOptions, MenuTrigger } from "react-native-popup-menu";

interface Props {
  song: Song;
  showMelody: boolean;
  isMelodyLoading: boolean;
  setShowMelody: (value: boolean) => void;
  setShowSongAudioModal: (value: boolean) => void;
  setShowMelodySettings: (value: boolean) => void;
}

const MelodyHeaderIconButton: React.FC<Props> = ({
                                                   song,
                                                   showMelody,
                                                   isMelodyLoading,
                                                   setShowMelody,
                                                   setShowSongAudioModal,
                                                   setShowMelodySettings
                                                 }) => {
  const styles = createStyles(useTheme());
  const toggleShowMelody = () => requestAnimationFrame(() => setShowMelody(songHasMelodyToShow && !showMelody));

  if (isMelodyLoading) {
    return <ActivityIndicator size={styles.loadIcon.fontSize}
                              style={styles.loadIcon}
                              color={styles.loadIcon.color} />;
  }

  const songHasMelodyToShow = hasMelodyToShow(song);
  const shouldShowMelodyCount = song.abcMelodies.length > 0;

  return <View>
    <Menu>
      <MenuTrigger customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
        <View style={[styles.container, (shouldShowMelodyCount ? {} : styles.containerSingle)]}
              accessibilityLabel={"Melody menu"}
              importantForAccessibility={"auto"}>
          <Icon name={"music"} style={styles.icon} />
          {!showMelody || !songHasMelodyToShow ? undefined :
            <Icon name={"slash"} style={[styles.icon, styles.iconOverlay]} />}

          {/* Show a dot for each available melody (if multiple), maxed at 4 dots/melodies */}
          {!shouldShowMelodyCount ? undefined :
            <View style={styles.countIndicator}>
              {song.abcMelodies.slice(0, 4)
                .map(it => <View key={it.id} style={styles.countIndicatorDot} />)}
            </View>
          }
        </View>
      </MenuTrigger>

      <MenuOptions customStyles={{optionsContainer: styles.popupContainer}}>
        <MenuOption style={styles.popupItem}
                    disabled={!songHasMelodyToShow}
                    onSelect={toggleShowMelody}>
          <Icon name={"eye"}
                style={[styles.popupItemIcon, (!songHasMelodyToShow ? styles.popupItemTextDisabled : {})]} />
          {!showMelody || !songHasMelodyToShow ? undefined :
            <Icon name={"slash"} style={[styles.popupItemIcon,
              styles.iconOverlay,
              { top: 15, left: 10 },
              (!songHasMelodyToShow ? styles.popupItemTextDisabled : {})]} />}

          <Text style={[styles.popupItemText, (!songHasMelodyToShow ? styles.popupItemTextDisabled : {})]}
                importantForAccessibility={"auto"}>
            {showMelody && songHasMelodyToShow ? "Hide" : "View"}
          </Text>
        </MenuOption>

        <MenuOption style={styles.popupItem}
                    onSelect={() => setShowSongAudioModal(true)}>
          <Icon name={"play"} style={styles.popupItemIcon} />
          <Text style={styles.popupItemText}
                importantForAccessibility={"auto"}>
            Play
          </Text>
        </MenuOption>

        <MenuOption style={styles.popupItem}
                    onSelect={() => setShowMelodySettings(true)}>
          <Icon name={"cog"} style={styles.popupItemIcon} />
          <Text style={styles.popupItemText}
                importantForAccessibility={"auto"}>
            Settings
          </Text>
        </MenuOption>
      </MenuOptions>
    </Menu>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  loadIcon: {
    fontSize: 26,
    color: colors.text.default,
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
    paddingBottom: 10
  },
  icon: {
    fontSize: 20,
    color: colors.text.default
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
    borderColor: colors.text.default,
    borderRadius: 10,
    borderWidth: 1.5,
    width: 0,
    height: 0,
    marginHorizontal: 1.5,
    marginBottom: 2
  },

  popupContainer: {
    backgroundColor: colors.surface2
  },
  popupItem: {
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    alignItems: "center"
  },
  popupItemIcon: {
    fontSize: 20,
    color: colors.text.default,
    width: 30,
    textAlign: "center"
  },
  popupItemText: {
    paddingLeft: 10,
    fontSize: 16,
    color: colors.text.default
  },
  popupItemTextDisabled: {
    color: colors.text.disabled
  }
});

export default MelodyHeaderIconButton;
