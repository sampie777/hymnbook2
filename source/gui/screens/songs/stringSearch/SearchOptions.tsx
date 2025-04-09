import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import SearchOption from "./SearchOption";
import FilterButton from "./filters/FilterButton";
import OrderByComponent from "./filters/OrderByComponent";
import { SongSearch } from "../../../../logic/songs/songSearch";
import SongBundleSelect from "./filters/SongBundleSelect";
import Animated, { FadeInUp } from "react-native-reanimated";

interface Props {
  isTitleActive?: boolean;
  onTitlePress?: () => void;
  isVerseActive?: boolean;
  onVersePress?: () => void;
  sortOrder: SongSearch.OrderBy;
  onSortOrderChange: (value: SongSearch.OrderBy) => void;
  selectedBundleUuids: string[];
  onSelectedBundleUuidsChange: (value: string[]) => void;
}

const SearchOptions: React.FC<Props> = ({
                                          isTitleActive,
                                          onTitlePress,
                                          isVerseActive,
                                          onVersePress,
                                          sortOrder,
                                          onSortOrderChange,
                                          selectedBundleUuids,
                                          onSelectedBundleUuidsChange
                                        }) => {
  const [showOrder, setShowOrder] = useState(false);

  return <View style={styles.container}>
    <View style={styles.row}>
      <SearchOption title={"Titles"} active={isTitleActive} onPress={onTitlePress} />
      <SearchOption title={"Verses"} active={isVerseActive} onPress={onVersePress} />
      <FilterButton onPress={() => setShowOrder(prev => !prev)} isOpen={showOrder} />
    </View>

    {!showOrder ? null :
      <Animated.View style={styles.column}
                     entering={FadeInUp.duration(200)}>
        <OrderByComponent value={sortOrder}
                          onChange={onSortOrderChange} />
        <SongBundleSelect selectedBundleUuids={selectedBundleUuids}
                          onChange={onSelectedBundleUuidsChange} />
      </Animated.View>
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
