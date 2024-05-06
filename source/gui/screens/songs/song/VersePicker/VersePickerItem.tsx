import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Verse } from "../../../../../logic/db/models/Songs";
import { getVerseShortName, getVerseType, VerseType } from "../../../../../logic/songs/utils";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";

interface ComponentProps {
  verse: Verse;
  isSelected?: boolean;
  onPress?: (verse: Verse) => void;
  onLongPress?: (verse: Verse) => void;
  horizontalMargin?: number;
}

const VersePickerItem: React.FC<ComponentProps> = ({
                                                     verse,
                                                     isSelected = false,
                                                     onPress,
                                                     onLongPress,
                                                     horizontalMargin = 8
                                                   }) => {
  const styles = createStyles(useTheme());

  const styleForVerseType = (type: VerseType) => {
    switch (type) {
      case VerseType.PreChorus:
      case VerseType.Chorus:
        return styles.chorus;
      case VerseType.Bridge:
        return styles.bridge;
      case VerseType.Intro:
        return styles.intro;
      case VerseType.End:
        return styles.end;
    }
  };

  return <TouchableOpacity style={[
    styles.container,
    styleForVerseType(getVerseType(verse)),
    (!isSelected ? {} : styles.containerSelected),
    { marginHorizontal: horizontalMargin }
  ]}
                           onPress={() => onPress?.(verse)}
                           onLongPress={() => onLongPress?.(verse)}
                           hitSlop={{
                             top: styles.container.marginVertical,
                             bottom: styles.container.marginVertical,
                             left: horizontalMargin,
                             right: horizontalMargin
                           }}>
    <Text style={[styles.text, (!isSelected ? {} : styles.textSelected)]}>
      {getVerseShortName(verse.name)}
    </Text>
  </TouchableOpacity>;
};

export default VersePickerItem;


const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface1,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 8,
    marginVertical: 8,
    minHeight: 50,
    minWidth: 50,
    paddingHorizontal: 12,
    borderRadius: 50,
    paddingVertical: 10
  },
  containerSelected: {
    backgroundColor: colors.primary.variant
  },

  text: {
    fontSize: 16,
    textAlign: "center",
    color: colors.text.default,
    opacity: 0.9
  },
  textSelected: {
    color: colors.onPrimary,
    opacity: 1
  },

  intro: {
    backgroundColor: isDark ? "#259332" : "#b6fdbf"
  },
  chorus: {
    backgroundColor: isDark ? "#bb1ac5" : "#fcd0ff"
  },
  bridge: {
    backgroundColor: isDark ? "#269b8c" : "#b7f5ed"
  },
  end: {
    backgroundColor: isDark ? "#a62828" : "#fdd8d8"
  }
});

export const versePickerItemStyles = createStyles;
