import React from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SearchResultItemBaseComponent } from "../../songs/search/SearchResultItemBaseComponent";
import { getFontScaleSync } from "react-native-device-info";

interface Props {
  hasPressedAnItem: boolean,
  setHasPressedAnItem: (value: boolean) => void,
  hasLongPressedAnItem: boolean,
  setHasLongPressedAnItem: (value: boolean) => void,
  hasAddedAnItem: boolean,
  setHasAddedAnItem: (value: boolean) => void,
  hasLongAddedAnItem: boolean,
  setHasLongAddedAnItem: (value: boolean) => void,
}

const SongSearchTutorialButtons: React.FC<Props> = ({
                                                      hasPressedAnItem, setHasPressedAnItem,
                                                      hasLongPressedAnItem, setHasLongPressedAnItem,
                                                      hasAddedAnItem, setHasAddedAnItem,
                                                      hasLongAddedAnItem, setHasLongAddedAnItem,
                                                    }) => {
  const onItemPress = () => {
    setHasPressedAnItem(true);
    let message = "You opened a song!";
    if (!hasAddedAnItem) {
      message += "\n\nTry the + button to see what that does.";
    } else if (!hasLongPressedAnItem) {
      message += "\n\nTry the holding your finger on this song to see what that does.";
    }
    Alert.alert("Opening song", message);
  }
  const onItemLongPress = () => {
    setHasLongPressedAnItem(true);
    let message = "This will let you first select the verses you want to open!";
    if (!hasPressedAnItem) {
      message += "\n\nTry the just quickly pressing this song to see what that does.";
    }
    Alert.alert("Opening song", message);
  }

  const onAddPress = () => {
    setHasAddedAnItem(true);
    let message = "This will add a song to your song list!";
    if (!hasPressedAnItem) {
      message += "\n\nTry tapping the name to see what that does.";
    } else if (!hasLongAddedAnItem) {
      message += "\n\nTry the holding your finger on this button to see what that does.";
    }
    Alert.alert("Saving song", message);
  }
  const onAddLongPress = () => {
    setHasLongAddedAnItem(true);
    let message = "This will let you first select the verses you want to add to your song list!";
    if (!hasAddedAnItem) {
      message += "\n\nTry the just quickly pressing this button to see what that does.";
    }
    Alert.alert("Saving song", message);
  }

  return <View style={styles.container}>
    {getFontScaleSync() > 1.5 ? null :  // Don't show this button when there's probably no space, as the FlatList/ScrollView doesn't work in the react-native-onboarding-swiper
      <SearchResultItemBaseComponent songName={"Psalm 57"}
                                     bundleName={hasPressedAnItem ? "Try pressing the + button!" : "Try pressing me!"}
                                     onItemPress={onItemPress}
                                     onItemLongPress={onItemLongPress}
                                     onAddPress={onAddPress}
                                     onAddLongPress={onAddLongPress} />
    }
    <SearchResultItemBaseComponent songName={"Song 57"}
                                   bundleName={hasLongPressedAnItem ? "Try long pressing the + button!" : "Try long pressing me!"}
                                   onItemPress={onItemPress}
                                   onItemLongPress={onItemLongPress}
                                   onAddPress={onAddPress}
                                   onAddLongPress={onAddLongPress} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});

export default SongSearchTutorialButtons;