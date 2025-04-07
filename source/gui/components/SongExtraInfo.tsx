import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5";
import { ThemeContextProps, useTheme } from "./providers/ThemeProvider";
import { DimensionValue } from "react-native/Libraries/StyleSheet/StyleSheetTypes";

type Props = {
  alternativeTitle?: string;
  songBundle?: string;
  width?: DimensionValue | undefined;
};

const SongExtraInfo: React.FC<Props> = ({ alternativeTitle, songBundle, width }) => {
  const styles = createStyles(useTheme());

  if (!(alternativeTitle || songBundle)) return null;

  return <View style={[styles.container, { width: width }]}>
    {!alternativeTitle ? null :
      <Text style={styles.text}
            importantForAccessibility={"auto"}>
        {alternativeTitle}
      </Text>
    }
    {!songBundle ? null :
      <View style={styles.songBundleContainer}>
        <Text style={styles.text}>
          <Icon name={"book"} />
        </Text>
        <Text style={styles.text}>
          {songBundle}
        </Text>
      </View>
    }
  </View>
};

export default SongExtraInfo;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 25,
    flexWrap: "wrap",
  },
  text: {
    fontSize: 14,
    color: colors.text.lighter,
    fontStyle: "italic",
  },
  songBundleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

});
