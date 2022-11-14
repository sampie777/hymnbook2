import React from "react";
import Settings from "../../../../settings";
import { ActivityIndicator, StyleSheet } from "react-native";
import { Song } from "../../../../logic/db/models/Songs";
import { hasMelodyToShow } from "../../../../logic/songs/utils";
import { hasVisibleNameForPicker } from "../../../../logic/songs/versePicker";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import HeaderIconButton from "../../../components/HeaderIconButton";
import HeaderIconVersePicker from "./HeaderIconVersePicker";

interface Props {
  song: Song & Realm.Object | undefined;
  showMelody: boolean;
  isMelodyLoading: boolean;
  openVersePicker: () => void;
  setShowMelody: (value: boolean) => void;
  setShowMelodySettings: (value: boolean) => void;
}

const ScreenHeader: React.FC<Props> = ({
                                         song,
                                         showMelody,
                                         isMelodyLoading,
                                         openVersePicker,
                                         setShowMelody,
                                         setShowMelodySettings
                                       }) => {
  const styles = createStyles(useTheme());

  const songHasMelodyToShow = hasMelodyToShow(song);
  const songHasVersesToPick = song?.verses?.some(hasVisibleNameForPicker);

  const toggleShowMelody = () => requestAnimationFrame(() => setShowMelody(!showMelody));

  return <>
    {!songHasMelodyToShow || !isMelodyLoading ? undefined :
      <ActivityIndicator size={styles.loadIcon.fontSize}
                         style={styles.loadIcon}
                         color={styles.loadIcon.color} />
    }
    {!songHasMelodyToShow || isMelodyLoading ? undefined :
      <HeaderIconButton icon={"music"}
                        iconOverlay={showMelody ? "slash" : undefined}
                        onPress={() => Settings.longPressForMelodyMenu ? toggleShowMelody() : setShowMelodySettings(true)}
                        onLongPress={() => Settings.longPressForMelodyMenu ? setShowMelodySettings(true) : toggleShowMelody()} />
    }

    {!songHasVersesToPick ? undefined :
      <HeaderIconVersePicker onPress={openVersePicker} />
    }
  </>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  loadIcon: {
    fontSize: 26,
    color: colors.text,
    paddingHorizontal: 7
  }
});

export default ScreenHeader;
