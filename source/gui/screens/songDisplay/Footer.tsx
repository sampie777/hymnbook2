import React from "react";
import { Song } from "../../../logic/db/models/Songs";
import { Animated, StyleSheet } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { isSongLanguageDifferentFromSongBundle } from "../../../logic/songs/utils";

interface Props {
  song?: Song;
}

const Footer: React.FC<Props> = ({ song }) => {
  const styles = createStyles(useTheme());

  function createCopyright() {
    if (song === undefined) {
      return "";
    }

    let copyright = "";
    const songBundle = Song.getSongBundle(song);
    if (songBundle !== undefined) {
      copyright += songBundle.name + "\n";
    }

    if (isSongLanguageDifferentFromSongBundle(song, songBundle)) {
      copyright += languageAbbreviationToFullName(song.language);
    }
    return copyright.trim();
  }

  return (<Animated.View style={styles.container}>
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
