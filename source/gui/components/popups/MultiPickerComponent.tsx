import React, { useState } from "react";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import ConfirmationModal from "./ConfirmationModal";
import { clearOrSelectAll } from "../../../logic/songs/versePicker";

interface Props<T> {
  selectedValues: Array<T>;
  values: Array<T>;
  onCompleted: (value: Array<T>) => void;
  onDenied?: () => void;
  rowContentRenderer: (item: T, isSelected: boolean) => React.ReactElement;
  keyExtractor: ((item: T, index: number) => string) | undefined;
  title?: string;
  closeText?: string;
  confirmText?: string;
  invertConfirmColor?: boolean;
}

const MultiPickerComponent = <T extends any>({
                                   selectedValues,
                                   values,
                                   onCompleted,
                                   onDenied,
                                   rowContentRenderer,
                                   keyExtractor,
                                   title = "Make a selection",
                                   closeText,
                                   confirmText,
                                   invertConfirmColor
                                 }: Props<T>) => {
  const [_selectedValues, setSelectedValues] = useState<T[]>(selectedValues);
  const styles = createStyles(useTheme());

  const toggleValue = (value: T) => {
    if (_selectedValues.includes(value)) {
      setSelectedValues(_selectedValues.filter(it => it != value));
    } else {
      setSelectedValues([..._selectedValues, value]);
    }
  };

  const clearOrSelectAll = () => setSelectedValues(_selectedValues.length > 0 ? [] : values);

  return <ConfirmationModal isOpen={true}
                            title={title}
                            closeText={closeText}
                            confirmText={confirmText ?? `Confirm (${_selectedValues.length})`}
                            invertConfirmColor={invertConfirmColor}
                            onClose={onDenied}
                            onConfirm={() => onCompleted(_selectedValues)}
                            showCloseButton={true}>
    <View style={styles.container}>
      <ScrollView style={styles.list}>
        {values.map((item, index) => {
            const isSelected = _selectedValues.includes(item);

            return <View key={keyExtractor?.(item, index)}
                         style={styles.row}>
              <TouchableOpacity style={[styles.rowButton, (isSelected ? styles.selectedItem : {})]}
                                onPress={() => toggleValue(item)}
                                onLongPress={clearOrSelectAll}>
                {rowContentRenderer(item, isSelected)}
              </TouchableOpacity>
            </View>;
          }
        )}
      </ScrollView>
    </View>
  </ConfirmationModal>;
};

export default MultiPickerComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignSelf: "stretch",
    minWidth: "90%",
    marginRight: -10,
    marginBottom: -30
  },

  row: {},
  rowButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center",
    borderLeftWidth: 4,
    borderColor: colors.surface2
  },

  selectedItem: {
    borderColor: colors.primary.light
  },

  list: {
    marginTop: 10
  }
});
