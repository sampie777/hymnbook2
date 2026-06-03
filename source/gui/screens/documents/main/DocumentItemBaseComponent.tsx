import React, { ReactNode } from 'react';
import { ThemeContextProps, useTheme, } from '../../../components/providers/ThemeProvider';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import SafeText from "../../../components/SafeText.tsx";

interface ScreenProps {
  documentName: string | ReactNode;
  parentName?: string;
  onPress?: () => void;
  content?: string | ReactNode;
  disabled?: boolean;
}

const DocumentItemBaseComponent: React.FC<ScreenProps> = ({
                                                            documentName,
                                                            parentName,
                                                            onPress,
                                                            content,
                                                            disabled = false,
                                                          }) => {
  const styles = createStyles(useTheme());

  return (
    <TouchableOpacity onPress={onPress}
                      disabled={disabled}
                      style={styles.container}>
      <SafeText
        style={[styles.itemName, parentName ? {} : styles.itemExtraPadding]}
        importantForAccessibility={'auto'}>
        {documentName}
      </SafeText>

      {!parentName ? undefined : (
        <View style={styles.documentGroupContainer}>
          <SafeText style={styles.parentName}>
            <Icon name={"book"} />
          </SafeText>
          <SafeText style={styles.parentName} importantForAccessibility={'auto'}>
            {parentName}
          </SafeText>
        </View>
      )}

      {content && <View style={styles.contentContainer}>{content}</View>}
    </TouchableOpacity>
  );
};

export default DocumentItemBaseComponent;

const createStyles = ({ colors }: ThemeContextProps) =>
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
      fontSize: 14,
      color: colors.text.lighter,
      fontStyle: 'italic',
    },

    documentGroupContainer: {
      paddingHorizontal: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 10,
    },

    contentContainer: {
      paddingHorizontal: 15,
      paddingBottom: 10,
      justifyContent: "flex-start"
    },
  });
