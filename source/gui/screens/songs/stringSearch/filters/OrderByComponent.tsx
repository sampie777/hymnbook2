import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import PickerComponent from "../../../../components/popups/PickerComponent";
import { SongSearch } from "../../../../../logic/songs/songSearch";

interface Props {
  value: SongSearch.OrderBy;
  onSortOrderChange: (value: SongSearch.OrderBy) => void;
}

const OrderByComponent: React.FC<Props> = ({ value, onSortOrderChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = createStyles(useTheme());

  const onChange = (newValue: SongSearch.OrderBy) => {
    setIsOpen(false);
    onSortOrderChange(newValue);
  };

  const toText = (value: SongSearch.OrderBy): string => {
    switch (value) {
      case SongSearch.OrderBy.Relevance:
        return "Relevance";
      case SongSearch.OrderBy.SongBundle:
        return "Song bundle";
    }
    return value;
  };

  return <View style={styles.container}>
    {!isOpen ? null :
      <PickerComponent selectedValue={value}
                       values={Object.keys(SongSearch.OrderBy) as SongSearch.OrderBy[]}
                       keyExtractor={item => item}
                       onDenied={() => setIsOpen(false)}
                       onCompleted={onChange}
                       rowContentRenderer={(item, isSelected) =>
                         <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}>
                           {toText(item)}
                         </Text>
                       } />
    }

    <TouchableOpacity style={styles.button}
                      onPress={() => setIsOpen(true)}>
      <Text style={styles.text}>
        Sort by: <Text style={{ fontWeight: "bold" }}>{toText(value)}</Text>
      </Text>
    </TouchableOpacity>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {},
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  text: {
    color: colors.text.default,
    fontSize: 16
  },

  pickerRowText: {
    color: colors.text.default,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold"
  }
});

export default OrderByComponent;
