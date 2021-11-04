import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ComponentProps {
  languages: Array<string>;
  selectedLanguage: string;
  onLanguageClick?: (language: string) => void;
}

const LanguageSelectBar: React.FC<ComponentProps> = ({ languages, selectedLanguage, onLanguageClick }) => {
  return (<View style={styles.container}>
    {languages.map(it => <TouchableOpacity key={it}
                                           onPress={() => onLanguageClick?.(it)}>
      <Text style={[styles.language, (it !== selectedLanguage ? [] : styles.selectedLanguage)]}>
        {it}
      </Text>
    </TouchableOpacity>)}
  </View>);
};

export default LanguageSelectBar;


const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 5,
    flexWrap: "wrap",
    justifyContent: "center"
  },

  language: {
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
    backgroundColor: "#f7f7f7",
    marginBottom: 5,
    marginLeft: 2,
    marginRight: 2
  },
  selectedLanguage: {
    backgroundColor: "#eee"
  }
});
