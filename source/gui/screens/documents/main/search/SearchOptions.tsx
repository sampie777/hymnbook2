import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { DocumentSearch } from "../../../../../logic/documents/documentSearch.ts";
import SearchOption from "../../../songs/stringSearch/SearchOption.tsx";
import OrderByComponent from "./filters/OrderByComponent.tsx";
import FilterButton from "../../../songs/stringSearch/filters/FilterButton.tsx";

interface Props {
  isTitleActive?: boolean;
  onTitlePress?: () => void;
  isContentActive?: boolean;
  onContentPress?: () => void;
  sortOrder: DocumentSearch.OrderBy;
  onSortOrderChange: (value: DocumentSearch.OrderBy) => void;
}

const SearchOptions: React.FC<Props> = ({
                                          isTitleActive,
                                          onTitlePress,
                                          isContentActive,
                                          onContentPress,
                                          sortOrder,
                                          onSortOrderChange,
                                        }) => {
  const [showOrder, setShowOrder] = useState(false);

  return <Animated.View style={styles.container}
                        entering={FadeInUp.duration(200)}>
    <View style={styles.row}>
      <SearchOption title={"Titles"} active={isTitleActive} onPress={onTitlePress} />
      <SearchOption title={"Content"} active={isContentActive} onPress={onContentPress} />
      <FilterButton onPress={() => setShowOrder(prev => !prev)} isOpen={showOrder} />
    </View>

    {!showOrder ? null :
      <Animated.View style={styles.column}
                     entering={FadeInUp.duration(200)}>
        <OrderByComponent value={sortOrder}
                          onChange={onSortOrderChange} />
      </Animated.View>
    }
  </Animated.View>;
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
