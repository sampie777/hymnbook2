import React from "react";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  title: string,
  iconName?: string,
  hideBorder?: boolean
}

const MelodySettingsModelHeader: React.FC<Props> = ({ title, iconName, hideBorder }) => {
  const styles = createStyles(useTheme());

  return <View style={[styles.container, (hideBorder ? styles.noBorder : {})]}>
    {iconName ? <Icon name={iconName} style={styles.icon} /> : null}
    <Text style={styles.text}>{title}</Text>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    marginTop: 15,
    borderTopWidth: 1,
    borderColor: colors.border.default,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10
  },
  noBorder: {
    marginTop: 5,
    borderTopWidth: 0,
    paddingTop: 0
  },
  text: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
    color: colors.text.light
  },
  icon: {
    fontSize: 12,
    color: colors.text.light
  }
});

export default MelodySettingsModelHeader;
