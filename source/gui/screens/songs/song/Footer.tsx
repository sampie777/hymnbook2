import React, { useEffect, useRef, useState } from "react";
import { Song } from "../../../../logic/db/models/Songs";
import { createCopyright } from "../../../../logic/songs/utils";
import { Animated, Dimensions, EmitterSubscription, ScaledSize, StyleSheet } from "react-native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { useHeaderHeight } from "@react-navigation/elements";

interface Props {
  song?: Song;
}

const Footer: React.FC<Props> = ({ song }) => {
  const dimensionChangeEventSubscription = useRef<EmitterSubscription>();
  const [windowHeight, setWindowHeight] = useState(Dimensions.get("window").height);
  const styles = createStyles(useTheme());

  useEffect(() => {
    dimensionChangeEventSubscription.current = Dimensions.addEventListener("change", handleDimensionsChange);
    return () => {
      dimensionChangeEventSubscription.current?.remove();
    };
  });

  const handleDimensionsChange = (e: { window: ScaledSize; screen?: ScaledSize; }) => {
    setWindowHeight(e.window.height);
  };

  return <Animated.View style={[styles.container, { minHeight: windowHeight - useHeaderHeight() - 200 }]}>
    <Animated.Text style={[styles.copyright]}>{createCopyright(song)}</Animated.Text>
  </Animated.View>;
};

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    paddingTop: 100,
    paddingBottom: 100,
    alignSelf: "center"
  },
  copyright: {
    textAlign: "center",
    color: colors.textLighter,
    fontFamily: fontFamily.sansSerifLight,
    lineHeight: 25
  }
});

export default Footer;
