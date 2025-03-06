import React from 'react';
import {
  ThemeContextProps,
  useTheme,
} from '../../../components/providers/ThemeProvider';
import {Text, TouchableOpacity, StyleSheet} from 'react-native';

interface ScreenProps {
  documentName: string;
  parentName?: string;
  onPress?: () => void;
}

const DocumentItemBaseComponent: React.FC<ScreenProps> = ({
  documentName,
  parentName,
  onPress,
}) => {
  const styles = createStyles(useTheme());

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text
        style={[styles.itemName, parentName ? {} : styles.itemExtraPadding]}
        importantForAccessibility={'auto'}>
        {documentName}
      </Text>

      {!parentName ? undefined : (
        <Text style={styles.parentName} importantForAccessibility={'auto'}>
          {parentName}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default DocumentItemBaseComponent;

const createStyles = ({colors}: ThemeContextProps) =>
  StyleSheet.create({
    container: {
      marginBottom: 1,
      backgroundColor: colors.surface1,
      borderColor: colors.border.default,
      borderBottomWidth: 1,
      flexDirection: 'column',
      alignItems: 'flex-start',
      paddingVertical: 8,
    },

    itemName: {
      paddingTop: 2,
      paddingHorizontal: 15,
      fontSize: 19,
      flex: 1,
      color: colors.text.default,
    },
    itemExtraPadding: {
      paddingTop: 5,
      paddingBottom: 7,
    },

    parentName: {
      paddingHorizontal: 15,
      fontSize: 14,
      color: colors.text.lighter,
      fontStyle: 'italic',
    },
  });
