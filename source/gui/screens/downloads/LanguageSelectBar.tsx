import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import PickerComponent from "../../components/popups/PickerComponent";

interface ComponentProps {
  languages: Array<string>;
  selectedLanguage: string;
  onLanguageClick?: (language: string) => void;
  disabled?: boolean;
  itemCountPerLanguage: Map<string, number>;
}

export const ShowAllLanguagesValue = "Show all";

const LanguageSelectBar: React.FC<ComponentProps> = ({
                                                       languages,
                                                       selectedLanguage,
                                                       onLanguageClick,
                                                       disabled = false,
                                                       itemCountPerLanguage
                                                     }) => {
  const [showPicker, setShowPicker] = useState(false);
  const styles = createStyles(useTheme());

  const openPicker = () => {
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const setLanguage = (language: string) => {
    closePicker();
    onLanguageClick?.(language);
  };

  return <View style={styles.container}>
    {!showPicker ? undefined :
      <PickerComponent selectedValue={selectedLanguage}
                       values={[ShowAllLanguagesValue, ...languages.sort()]}
                       keyExtractor={item => item}
                       onDenied={closePicker}
                       onCompleted={it => setLanguage(it)}
                       rowContentRenderer={(item, isSelected) =>
                         <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}>
                           {languageAbbreviationToFullName(item)}
                           {itemCountPerLanguage.get(item) ? ` (${itemCountPerLanguage.get(item)})` : undefined}
                         </Text>
                       } />
    }

    <Text style={styles.label}>
      Language:
    </Text>

    <TouchableOpacity style={styles.button}
                      onPress={openPicker}
                      disabled={disabled}>
      <Text style={styles.selectedLanguage}
            importantForAccessibility={"auto"}>
        {languageAbbreviationToFullName(selectedLanguage)}
      </Text>
      <Icon name={"caret-down"} style={styles.arrow} />
    </TouchableOpacity>
  </View>;
};

export default LanguageSelectBar;


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 5,
    alignItems: "center"
  },

  label: {
    flex: 1,
    color: colors.text.default,
    fontSize: 15
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    right: -5,
    paddingHorizontal: 15,
    paddingVertical: 10
  },

  selectedLanguage: {
    color: colors.text.default,
    fontSize: 15
  },
  arrow: {
    fontSize: 16,
    marginLeft: 7,
    color: colors.text.default
  },

  pickerRowText: {
    color: colors.text.default,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold"
  }
});
