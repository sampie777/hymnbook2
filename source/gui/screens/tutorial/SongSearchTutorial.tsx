import React, { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { SearchResultItemBaseComponent } from "../songs/search/SearchResultItemBaseComponent";

interface Props {
}

const SongSearchTutorial: React.FC<Props> = ({}) => {
  const [hasPressedAnItem, setHasPressedAnItem] = useState(false);
  const [hasLongPressedAnItem, setHasLongPressedAnItem] = useState(false);
  const [hasAddedAnItem, setHasAddedAnItem] = useState(false);
  const [hasLongAddedAnItem, setHasLongAddedAnItem] = useState(false);

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
    <SearchResultItemBaseComponent songName={"Psalm 57"}
                                   bundleName={"Try pressing or long pressing me!"}
                                   onItemPress={onItemPress}
                                   onItemLongPress={onItemLongPress}
                                   onAddPress={onAddPress}
                                   onAddLongPress={onAddLongPress} />
    <SearchResultItemBaseComponent songName={"Song 57"}
                                   bundleName={"Or me!"}
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

export default SongSearchTutorial;
