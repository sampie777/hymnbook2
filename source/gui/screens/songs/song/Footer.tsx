import React from "react";
import Settings from "../../../../settings";
import { Song } from "../../../../logic/db/models/Songs";
import { createCopyright } from "../../../../logic/songs/utils";
import { Animated, StyleSheet, useWindowDimensions } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { useHeaderHeight } from "@react-navigation/elements";

interface Props {
  song?: Song;
  scale: Animated.Value;
}

const Footer: React.FC<Props> = ({ song, scale }) => {
  const styles = createStyles(useTheme());
  const windowDimension = useWindowDimensions();
  const animatedStyle = {
    container: {
      paddingTop: Animated.multiply(scale, styles.container.paddingTop),
      paddingBottom: Animated.multiply(scale, styles.container.paddingBottom)
    },
    divider: {
      marginBottom: Animated.multiply(scale, styles.divider.marginBottom)
    },
    text: {
      lineHeight: Animated.multiply(scale, styles.text.lineHeight),
      fontSize: Animated.multiply(scale, styles.text.fontSize),
      paddingBottom: Animated.multiply(scale, styles.text.paddingBottom)
    }
  };

  return <Animated.View
    style={[styles.container, animatedStyle.container, { minHeight: windowDimension.height - useHeaderHeight() - 200 }]}>
    <Animated.View style={[styles.divider, animatedStyle.divider]}></Animated.View>
    {createCopyright(song).map((it, i) =>
      <Animated.Text key={i}
                     style={[styles.text, animatedStyle.text]}
                     selectable={Settings.enableTextSelection}>
        {it}
      </Animated.Text>
    )}
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingBottom: 100
  },
  divider: {
    marginBottom: 30,
    width: "50%",
    alignSelf: "center",
    borderTopColor: colors.border.default,
    borderTopWidth: 1
  },
  text: {
    textAlign: "center",
    color: colors.text.lighter,
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 20,
    fontSize: 14,
    paddingBottom: 5
  }
});

export default Footer;
