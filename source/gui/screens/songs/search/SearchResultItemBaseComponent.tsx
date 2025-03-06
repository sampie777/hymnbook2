import React from "react";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { RectangularInset } from "../../../components/utils";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import OffscreenTouchableOpacity from "../../../components/OffscreenTouchableOpacity";

export const SearchResultItemAddButton: React.FC<{
  songAddedToSongList?: boolean,
  onPress?: () => void,
  onLongPress?: () => void,
}> = ({
        songAddedToSongList,
        onPress,
        onLongPress,
      }) => {
  const styles = createStyles(useTheme());

  return <TouchableOpacity onPress={onPress}
                           onLongPress={onLongPress}
                           style={styles.button}
                           hitSlop={RectangularInset(styles.infoContainer.paddingVertical)}
                           accessibilityLabel={"Add to song list"}>
    <Icon name={songAddedToSongList ? "check" : "plus"}
          size={styles.button.fontSize}
          color={songAddedToSongList
            ? styles.buttonHighlight.color as string
            : styles.button.color as string} />
  </TouchableOpacity>
}

export const SearchResultItemBaseComponent: React.FC<{
  songName: string,
  bundleName?: string,
  songAddedToSongList?: boolean,
  onItemPress?: () => void,
  onItemLongPress?: () => void,
  onAddPress?: () => void,
  onAddLongPress?: () => void,
  fontScale?: number,
}> =
  ({
     songName,
     bundleName,
     songAddedToSongList,
     onItemPress,
     onItemLongPress,
     onAddPress,
     onAddLongPress,
     fontScale = 1,
   }) => {
    const styles = createStyles(useTheme());

    return <OffscreenTouchableOpacity onPress={onItemPress}
                                      onLongPress={onItemLongPress}
                                      style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={[styles.itemName, {fontSize: styles.itemName.fontSize * fontScale}, (bundleName ? {} : styles.itemExtraPadding)]}
              importantForAccessibility={"auto"}>
          {songName}
        </Text>

        {!bundleName ? undefined :
          <Text style={[styles.songBundleName, {fontSize: styles.songBundleName.fontSize * fontScale}]}
                importantForAccessibility={"auto"}>
            {bundleName}
          </Text>
        }
      </View>

      {onAddPress === undefined && onAddLongPress === undefined ? null :
        <SearchResultItemAddButton onPress={onAddPress}
                                   onLongPress={onAddLongPress}
                                   songAddedToSongList={songAddedToSongList} />
      }
    </OffscreenTouchableOpacity>;
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginBottom: 1,
    backgroundColor: colors.surface1,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },

  infoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingVertical: 8
  },

  songBundleName: {
    paddingHorizontal: 15,
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic"
  },

  itemName: {
    paddingTop: 2,
    paddingHorizontal: 15,
    fontSize: 24,
    color: colors.text.default
  },
  itemExtraPadding: {
    paddingTop: 5,
    paddingBottom: 7
  },

  button: {
    marginRight: 8,
    height: 45,
    width: 45,
    fontSize: 22,
    color: colors.primary.light,
    backgroundColor: colors.surface2,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3
  },
  buttonHighlight: {
    color: colors.primary.default
  }
});
