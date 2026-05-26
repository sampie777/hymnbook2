import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DocumentSearch } from "../../../../../../logic/documents/documentSearch.ts";
import { ThemeContextProps, useTheme } from "../../../../../components/providers/ThemeProvider.tsx";
import PickerComponent from "../../../../../components/popups/PickerComponent.tsx";

interface Props {
  value: DocumentSearch.OrderBy;
  onChange: (value: DocumentSearch.OrderBy) => void;
}

const OrderByComponent: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const styles = createStyles(useTheme());

  const _onChange = (newValue: DocumentSearch.OrderBy) => {
    setIsOpen(false);
    onChange(newValue);
  };

  const toText = (value: DocumentSearch.OrderBy): string => {
    switch (value) {
      case DocumentSearch.OrderBy.Relevance:
        return "Relevance";
      case DocumentSearch.OrderBy.Group:
        return "Group";
    }
    return value;
  };

  return <View style={styles.container}>
    {!isOpen ? null :
      <PickerComponent selectedValue={value}
                       values={Object.keys(DocumentSearch.OrderBy) as DocumentSearch.OrderBy[]}
                       keyExtractor={item => item}
                       onDenied={() => setIsOpen(false)}
                       onCompleted={_onChange}
                       rowContentRenderer={(item, isSelected) =>
                         <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}
                               importantForAccessibility={"auto"}>
                           {toText(item)}
                         </Text>
                       } />
    }

    <TouchableOpacity style={styles.button}
                      onPress={() => setIsOpen(true)}>
      <Text style={styles.text}
            importantForAccessibility={"auto"}>
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
