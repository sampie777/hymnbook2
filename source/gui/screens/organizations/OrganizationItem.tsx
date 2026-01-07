import React, { useMemo } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { Organization } from "../../../logic/db/models/organizations/Organizations.ts";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider.tsx";
import { generateRandomColor } from "../../../logic/utils/utils.ts";

interface Props {
  organization: Organization
  index: number
}

const OrganizationItem: React.FC<Props> = ({
                                             organization,
                                             index
                                           }) => {
  const styles = createStyles(useTheme())

  const logoBackgroundColor = useMemo(() => generateRandomColor(index, 125), [index]);

  return <TouchableOpacity key={organization.uuid}>
    <Animated.View
      style={styles.container}
      entering={FadeInUp.duration(200).delay(index * 30)}
      exiting={FadeOut.duration(200).delay(index * 30)}>
      {organization.logo
        ? <Image src={organization.logo} style={[styles.logo, { backgroundColor: logoBackgroundColor }]} />
        : <View style={[styles.logo, { backgroundColor: logoBackgroundColor }]} >
          <Text style={styles.logoText}>{organization.name[0]}</Text>
        </View>
      }
      <Text style={styles.name}>{organization.name}</Text>
    </Animated.View>
  </TouchableOpacity>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 5,
    backgroundColor: colors.surface1,
  },
  name: {
    fontSize: 16,
    color: colors.text.default,
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
    color: "#fff",
  }
});

export default OrganizationItem;
