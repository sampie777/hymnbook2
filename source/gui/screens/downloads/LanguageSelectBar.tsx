import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import Icon from "react-native-vector-icons/FontAwesome5";
import PickerComponent from "../../components/popups/PickerComponent";

interface ComponentProps {
  languages: Array<string>;
  selectedLanguage: string;
  onLanguageClick?: (language: string) => void;
  disabled: boolean;
}

const LanguageSelectBar: React.FC<ComponentProps> = ({ languages, selectedLanguage, onLanguageClick, disabled }) => {
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
                       values={languages.sort()}
                       keyExtractor={item => item}
                       onDenied={closePicker}
                       onCompleted={it => setLanguage(it)}
                       rowContentRenderer={(item, isSelected) =>
                         <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}>
                           {languageAbbreviationToFullName(item)}
                         </Text>
                       } />
    }

    <Text style={styles.label}>Language:</Text>

    <TouchableOpacity style={styles.button}
                      onPress={openPicker}
                      disabled={disabled}>
      <Text style={styles.selectedLanguage}>
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
    color: colors.text,
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
    color: colors.text,
    fontSize: 15
  },
  arrow: {
    fontSize: 16,
    marginLeft: 7,
    color: colors.text
  },

  pickerRowText: {
    color: colors.text,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold"
  }
});
