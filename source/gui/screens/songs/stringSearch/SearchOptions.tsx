import React from "react";
import { StyleSheet, View } from "react-native";
import SearchOption from "./SearchOption";

interface Props {
  isTitleActive?: boolean;
  isVerseActive?: boolean;
  isBundleActive?: boolean;

  onTitlePress?(): void;

  onVersePress?(): void;

  onBundlePress?(): void;
}

const SearchOptions: React.FC<Props> = ({
                                          isTitleActive,
                                          isVerseActive,
                                          isBundleActive,
                                          onTitlePress,
                                          onVersePress,
                                          onBundlePress
                                        }) => {
  return <View style={styles.container}>
    <SearchOption title={"Titles"} active={isTitleActive} onPress={onTitlePress} />
    <SearchOption title={"Verses"} active={isVerseActive} onPress={onVersePress} />
    <SearchOption title={"Bundles"} active={isBundleActive} onPress={onBundlePress} />
  </View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 5
  }
});

export default SearchOptions;
