import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../../components/providers/ThemeProvider";
import { SongAudio } from "../../../../../../logic/db/models/Songs";
import { readableFileSizeSI } from "../../../../../../logic/utils";

interface Props {
  item: SongAudio;
  isSelected: boolean;
  onPress: () => void;
}

const AudioItem: React.FC<Props> = ({ item, isSelected, onPress }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity style={styles.container}
                           onPress={onPress}>
    <View style={[styles.selection, (isSelected ? styles.selectionSelected : {})]} />
    <Text style={[styles.text, (isSelected ? styles.textSelected : {})]}>
      {item.name}
    </Text>
    {item.fileSize ? <Text style={styles.fileSize}>{readableFileSizeSI(item.fileSize)}</Text> : null}
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => {
  const selectionSize = 15;
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center"
    },
    text: {
      color: colors.text.default,
      flex: 1
    },
    textSelected: {
      fontWeight: "bold"
    },
    selection: {
      borderWidth: 1,
      borderColor: colors.border.variant,
      borderRadius: selectionSize,
      width: selectionSize,
      height: selectionSize,
      marginVertical: 15,
      marginHorizontal: 15
    },
    selectionSelected: {
      backgroundColor: colors.primary.default
    },

    fileSize: {
      color: colors.text.lighter,
      fontSize: 12,
    }
  });
};

export default AudioItem;
