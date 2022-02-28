import React from "react";
import { Song } from "../../models/Songs";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";

interface Props {
  opacity: Animated.Value<number>,
  song?: Song
}

const Footer: React.FC<Props> =
  ({ opacity, song }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = {
      container: {
        opacity: opacity
      }
    };

    function createCopyright() {
      if (song === undefined) {
        return "";
      }

      let copyright = "";
      const songBundle = Song.getSongBundle(song);
      if (songBundle !== undefined) {
        copyright += songBundle.name + "\n";
      }

      copyright += song.language || songBundle?.language || "";
      return copyright.trim();
    }

    return (<Animated.View style={[styles.container, animatedStyle.container]}>
      <Animated.Text style={[styles.copyright]}>{createCopyright()}</Animated.Text>
    </Animated.View>);
  };

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  },
  copyright: {
    textAlign: "center",
    color: colors.textLighter,
    fontFamily: "sans-serif-light",
    marginTop: 20,
    lineHeight: 25
  }
});

export default Footer;