import React from "react";
import { ThemeContextProps, useTheme } from "../providers/ThemeProvider";
import { FlatList, ListRenderItemInfo, Modal, StyleSheet, TouchableOpacity, View } from "react-native";

interface Props<T> {
  selectedValue: T,
  values: Array<T>,
  onCompleted?: (value: T) => void,
  onDenied?: () => void,
  rowContentRenderer: (item: T, isSelected: boolean) => React.ReactElement,
  keyExtractor: ((item: T, index: number) => string) | undefined;
}

function PickerComponent<T>({
                              selectedValue,
                              values,
                              onCompleted,
                              onDenied,
                              rowContentRenderer,
                              keyExtractor
                            }: Props<T>) {
  const styles = createStyles(useTheme());

  const renderRow = ({ item, index }: ListRenderItemInfo<T>) => {
    return <View style={[styles.row, (index === 0 ? styles.rowFirstChild : {})]}>
      <TouchableOpacity style={styles.rowButton}
                        onPress={() => onCompleted?.(item)}>
        {rowContentRenderer(item, item === selectedValue)}
      </TouchableOpacity>
    </View>;
  };

  return <Modal
    animationType="none"
    transparent={true}
    visible={true}
    onRequestClose={onDenied}
  >
    <TouchableOpacity activeOpacity={0.9}
                      style={styles.centeredView}
                      onPress={onDenied}>
      <View style={styles.modalView}>
        <FlatList data={values}
                  keyExtractor={keyExtractor}
                  renderItem={renderRow} />
      </View>
    </TouchableOpacity>
  </Modal>;
}

export default PickerComponent;

const createStyles = ({ isDark, colors }: ThemeContextProps) => StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: isDark ? "#0008" : "#0002"
  },

  modalView: {
    margin: 20,
    minWidth: "80%",
    backgroundColor: colors.surface2,
    borderRadius: 8,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  row: {
    borderTopWidth: 1,
    borderColor: colors.border.default
  },
  rowFirstChild: {
    borderTopWidth: 0
  },
  rowButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "center"
  }
});
