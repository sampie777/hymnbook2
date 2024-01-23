import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import SearchOption from "./SearchOption";
import FilterButton from "./filters/FilterButton";
import OrderByComponent from "./filters/OrderByComponent";
import { SongSearch } from "../../../../logic/songs/songSearch";

interface Props {
  isTitleActive?: boolean;
  isVerseActive?: boolean;
  isBundleActive?: boolean;
  sortOrder: SongSearch.OrderBy;

  onTitlePress?: () => void;
  onVersePress?: () => void;
  onBundlePress?: () => void;
  onSortOrderChange: (value: SongSearch.OrderBy) => void;
}

const SearchOptions: React.FC<Props> = ({
                                          isTitleActive,
                                          isVerseActive,
                                          isBundleActive,
                                          sortOrder,
                                          onTitlePress,
                                          onVersePress,
                                          onBundlePress,
                                          onSortOrderChange
                                        }) => {
  const [showOrder, setShowOrder] = useState(false);

  return <View style={styles.container}>
    <View style={styles.row}>
      <SearchOption title={"Titles"} active={isTitleActive} onPress={onTitlePress} />
      <SearchOption title={"Verses"} active={isVerseActive} onPress={onVersePress} />
      {/*<SearchOption title={"Bundles"} active={isBundleActive} onPress={onBundlePress} />*/}
      <FilterButton onPress={() => setShowOrder(prev => !prev)} isOpen={showOrder} />
    </View>

    {!showOrder ? null :
      <View style={styles.column}>
        <OrderByComponent value={sortOrder}
                          onSortOrderChange={onSortOrderChange} />
      </View>
    }
  </View>;
};

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: "row",
    paddingHorizontal: 5,
    alignItems: "center"
  },
  column: {
    flexDirection: "column",
    paddingHorizontal: 5,
    alignItems: "stretch",
    paddingTop: 10
  }
});

export default SearchOptions;
