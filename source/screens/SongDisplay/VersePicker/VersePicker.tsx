import React, { useEffect, useState } from "react";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { StyleSheet, View, Text, Dimensions, ScaledSize } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import VersePickerItem, { versePickerItemStyles as createVersePickerItemStyles } from "./VersePickerItem";
import { routes, ParamList } from "../../../navigation";
import { Verse, VerseProps } from "../../../models/Songs";
import HeaderIconButton from "../../../components/HeaderIconButton";
import SongList from "../../../scripts/songs/songList";
import {
  clearOrSelectAll,
  getMarginForVerses,
  isVerseInList,
  toggleVerseInList
} from "../../../scripts/songs/versePicker";

interface ComponentProps extends NativeStackScreenProps<ParamList, "VersePicker"> {
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const [selectedVerses, setSelectedVerses] = useState<Array<VerseProps>>(route.params.selectedVerses || []);
  const verses: Array<Verse> = route.params.verses || [];
  const songListIndex: number | undefined = route.params.songListIndex;
  const styles = createStyles(useTheme());
  const versePickerItemStyles = createVersePickerItemStyles(useTheme());
  const [horizontalMargin, setHorizontalMargin] = useState(
    getMarginForVerses(Dimensions.get("window"),
      styles.verseList.paddingHorizontal,
      versePickerItemStyles.container.minWidth));

  useEffect(() => {
    // Set the callback function for the button in this hook,
    // so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton icon={"check"} onPress={submit} />
      )
    });
  }, [selectedVerses]);

  useEffect(() => {
    onFocus();
    return onBlur;
  }, []);

  const onFocus = () => {
    Dimensions.addEventListener("change", handleDimensionsChange);
  };

  const onBlur = () => {
    Dimensions.removeEventListener("change", handleDimensionsChange);
  };

  const handleDimensionsChange = (e: { window: ScaledSize; screen?: ScaledSize; }) => {
    setHorizontalMargin(getMarginForVerses(e.window,
      styles.verseList.paddingHorizontal,
      versePickerItemStyles.container.minWidth));
  };

  const toggleVerse = (verse: VerseProps) => {
    setSelectedVerses(toggleVerseInList(selectedVerses, verse));
  };

  const onItemLongPress = () => {
    setSelectedVerses(clearOrSelectAll(selectedVerses, verses));
  };

  const submit = () => {
    let versesToSubmit = selectedVerses;
    if (versesToSubmit.length === verses.length) {
      versesToSubmit = [];
    }

    if (songListIndex !== undefined) {
      SongList.saveSelectedVersesForSong(songListIndex, versesToSubmit);
    }

    if (route.params.navigateToOnSubmit !== undefined) {
      navigation.navigate(route.params.navigateToOnSubmit);
      return;
    }

    navigation.navigate({
      name: routes.Song,
      params: {
        selectedVerses: versesToSubmit
      },
      merge: true // Navigate 'back'
    });
  };

  return (<View style={styles.container}>
    {verses !== undefined ? undefined : <Text>Failed to load verses</Text>}
    <ScrollView contentContainerStyle={styles.verseList}>
      {verses?.map((it: VerseProps) => <VersePickerItem verse={it}
                                                        key={it.id}
                                                        isSelected={isVerseInList(selectedVerses, it)}
                                                        horizontalMargin={horizontalMargin}
                                                        onPress={toggleVerse}
                                                        onLongPress={onItemLongPress} />)}
    </ScrollView>
  </View>);
};

export default VersePicker;


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  verseList: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingVertical: 20
  }
});
