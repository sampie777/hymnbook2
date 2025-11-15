import React from "react";
import { StyleSheet, Text, View } from "react-native";
import MultiPickerComponent from "./MultiPickerComponent";
import { SongBundle } from "../../../logic/db/models/songs/Songs";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import { languageAbbreviationToFullName } from "../../../logic/utils/utils.ts";

interface Props {
  bundles: SongBundle[];
  selectedBundles: SongBundle[];
  onConfirm: (value: SongBundle[]) => void;
  onDenied: () => void;
  title?: string;
}

const SongBundlePicker: React.FC<Props> = ({ bundles, selectedBundles, onConfirm, onDenied, title }) => {
  const styles = createStyles(useTheme());
  const showLanguage = bundles.some(it => it.language != bundles[0].language);
  return <MultiPickerComponent selectedValues={selectedBundles.length == 0 ? bundles : selectedBundles}
                               values={bundles.sort((a, b) => a.name.localeCompare(b.name))}
                               invertConfirmColor={true}
                               keyExtractor={item => item.uuid}
                               title={title}
                               onDenied={onDenied}
                               onCompleted={onConfirm}
                               rowContentRenderer={(item, isSelected) =>
                                 <View style={styles.container}>
                                   <Text style={[styles.titleText, (isSelected ? styles.titleTextSelected : {})]}
                                         importantForAccessibility={"auto"}>
                                     {item.name}
                                   </Text>

                                   {!showLanguage ? null :
                                     <View style={styles.infoContainer}>
                                       {item.language === undefined || item.language === "" ? undefined :
                                         <Text style={styles.infoText}
                                               importantForAccessibility={"auto"}>
                                           {languageAbbreviationToFullName(item.language)}
                                         </Text>
                                       }
                                     </View>
                                   }
                                 </View>} />;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  titleText: {
    flex: 1,
    fontSize: 17,
    color: colors.text.default
  },
  titleTextSelected: {
    fontWeight: "bold"
  },
  infoContainer: {
    paddingLeft: 5,
    marginRight: -20,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.text.lighter
  }
});

export default SongBundlePicker;
