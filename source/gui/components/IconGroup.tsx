import React, { cloneElement, ReactElement } from "react";
import { StyleSheet, View } from "react-native";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

interface Props {
}

/**
 * Usage of component: pass 1, 2, or 3 children.
 * The first child will be the main component.
 * The second will be made smaller.
 * A copy of the second will be used as background contrast if no third component for this purpose is supplied.
 * @param children
 * @constructor
 */
const IconGroup: React.FC<Props> = ({ children }) => {
  const styles = createStyles(useTheme());

  let mainIcon;
  let secondIcon = undefined;
  let secondIconBackground = undefined;

  if (children instanceof Array) {
    mainIcon = children[0];

    if (children.length > 1) {
      secondIcon = children[1];

      if (children.length > 2) {
        secondIconBackground = cloneElement(children[2] as ReactElement, {
          style: { color: styles.secondBackground.color }
        });
      } else {
        secondIconBackground = cloneElement(secondIcon as ReactElement, {
          style: { color: styles.secondBackground.color }
        });
      }
    }
  } else {
    mainIcon = children;
  }

  return <View style={styles.container}>
    <View style={styles.main}>{mainIcon}</View>
    <View style={styles.secondContainer}>
      <View style={styles.secondBackground}>{secondIconBackground}</View>
      <View style={styles.second}>{secondIcon}</View>
    </View>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center"
  },

  main: {},
  secondContainer: {
    position: "absolute",
    transform: [
      { scale: 0.75 }
    ],
    right: -8,
    bottom: -8,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 1
  },
  secondBackground: {
    position: "absolute",
    transform: [
      { scale: 2.1 }
    ],
    color: colors.surface1,
    borderRadius: 3,
    overflow: "hidden"
  },
  second: {}
});

export default IconGroup;
