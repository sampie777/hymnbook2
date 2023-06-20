import React from "react";
import { StyleSheet, View } from "react-native";
import { Song } from "../../../../logic/db/models/Songs";
import { hasVisibleNameForPicker } from "../../../../logic/songs/versePicker";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import HeaderIconVersePicker from "./HeaderIconVersePicker";
import MelodyHeaderIconButton from "./melody/MelodyHeaderIconButton";

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

  const songHasVersesToPick = song?.verses?.some(hasVisibleNameForPicker);

  return <View style={styles.container}>
    {!song ? undefined :
      <MelodyHeaderIconButton song={song}
                              showMelody={showMelody}
                              isMelodyLoading={isMelodyLoading}
                              setShowMelodySettings={setShowMelodySettings}
                              setShowMelody={setShowMelody} />
    }

    {!songHasVersesToPick ? undefined :
      <HeaderIconVersePicker onPress={openVersePicker} />
    }
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center"
  },
  loadIcon: {
    fontSize: 26,
    color: colors.text.default,
    paddingHorizontal: 7
  }
});

export default ScreenHeader;
