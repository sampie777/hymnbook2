import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import VersePickerItem from "./VersePickerItem";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { routes } from "../../../navigation";
import { VerseProps } from "../../../models/Songs";
import HeaderIconButton from "../../../components/HeaderIconButton";

interface ComponentProps {
  route: any;
  navigation: DrawerNavigationProp<any>;
}

const VersePicker: React.FC<ComponentProps> = ({ route, navigation }) => {
  const [selectedVerses, setSelectedVerses] = useState<Array<VerseProps>>(route.params.selectedVerses || []);
  const verses = route.params.verses;

  useEffect(() => {
    // Set the callback function for the button in this hook, so the function will use the updated values. Strange behaviour, I know..
    navigation.setOptions({
      headerRight: () => (
        <HeaderIconButton icon={"check"} onPress={submit} />
      )
    });
  }, [selectedVerses]);

  const toggleVerse = (verse: VerseProps) => {
    let newSelection: Array<VerseProps>;
    if (isVerseListed(verse)) {
      newSelection = selectedVerses.filter(it => it.id !== verse.id);
    } else {
      newSelection = selectedVerses.concat(verse);
    }

    newSelection = newSelection.sort((a, b) => a.index - b.index);
    setSelectedVerses(newSelection);
  };

  const isVerseListed = (verse: VerseProps): boolean => {
    return selectedVerses.includes(verse);
  };

  const submit = () => {
    navigation.navigate({
      name: routes.Song,
      params: {
        selectedVerses: selectedVerses
      },
      merge: true, // Navigate 'back'
    });
  };

  return (<View style={styles.container}>
    {verses !== undefined ? undefined : <Text>Failed to load verses</Text>}
    <ScrollView contentContainerStyle={styles.verseList}>
      {verses?.map((it: VerseProps) => <VersePickerItem verse={it}
                                                        key={it.id}
                                                        isSelected={isVerseListed(it)}
                                                        onPress={toggleVerse} />)}
    </ScrollView>
  </View>);
};

export default VersePicker;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch"
  },

  verseList: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingVertical: 20
  }
});
