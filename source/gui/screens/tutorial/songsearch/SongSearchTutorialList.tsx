import React, { PropsWithChildren } from "react";
import { StyleProp, StyleSheet, Text, TextStyle, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";

interface ItemProps extends PropsWithChildren {
  isCompleted: boolean,
  subTitleStyles?: StyleProp<TextStyle> | undefined,
}

const ListItem: React.FC<ItemProps> = ({ children, isCompleted, subTitleStyles }) => {
  const styles = createStyles(useTheme());

  return <View style={styles.item}>
    <Icon name={isCompleted ? "check" : "genderless"}
          style={[styles.text, isCompleted ? styles.textCompleted : styles.textNotCompleted, styles.icon]} />
    <Text style={[subTitleStyles, styles.text, isCompleted ? styles.textCompleted : styles.textNotCompleted]}>
      {children}
    </Text>
  </View>
}

interface Props {
  hasPressedAnItem: boolean,
  hasLongPressedAnItem: boolean,
  hasAddedAnItem: boolean,
  hasLongAddedAnItem: boolean,
  subTitleStyles?: StyleProp<TextStyle> | undefined
}

const SongSearchTutorialList: React.FC<Props> = ({
                                                   hasPressedAnItem,
                                                   hasLongPressedAnItem,
                                                   hasAddedAnItem,
                                                   hasLongAddedAnItem,
                                                   subTitleStyles
                                                 }) => {
  const styles = createStyles(useTheme());

  return <View style={styles.container}>
    <Text style={[subTitleStyles, styles.text]}>There are ways to interact with a song:</Text>
    <ListItem subTitleStyles={subTitleStyles} isCompleted={hasPressedAnItem}>
      Tap on the song name
    </ListItem>
    <ListItem subTitleStyles={subTitleStyles} isCompleted={hasAddedAnItem}>
      Tap on the + button
    </ListItem>
    <ListItem subTitleStyles={subTitleStyles} isCompleted={hasLongPressedAnItem || hasLongAddedAnItem}>
      Long press either
    </ListItem>
    <Text style={subTitleStyles}>{'\n'}Try it on the buttons above!</Text>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 10,
  },
  text: {
    textAlign: "left",
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  icon: {
    fontSize: 16,
    fontVariant: ["tabular-nums"],
    minWidth: 30,
    textAlign: "center"
  },
  textCompleted: {
    color: colors.text.success,
  },
  textNotCompleted: {
    color: colors.text.warning,
  },
});

export default SongSearchTutorialList;
