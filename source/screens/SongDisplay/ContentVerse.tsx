import React from "react";
import { StyleSheet, View } from "react-native";
import Animated  from "react-native-reanimated";

interface ContentVerseProps {
  title: string;
  content: string;
  scale: Animated.Value<number>;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ title, content, scale }) => {

  const scalableStyles = {
    container: {
      marginBottom: Animated.multiply(scale, 50)
    },
    title: {
      fontSize: Animated.multiply(scale, 14),
      marginBottom: Animated.multiply(scale, 7),
    },
    text: {
      fontSize: Animated.multiply(scale, 20),
      lineHeight: Animated.multiply(scale, 30)
    }
  };

  return (
    <Animated.View style={[styles.container, scalableStyles.container]}>
      {title === "" ? null :
        <Animated.Text style={[styles.title, scalableStyles.title]}>{title}</Animated.Text>}
      <Animated.Text style={[styles.text, scalableStyles.text]}>{content}</Animated.Text>
    </Animated.View>
  );
};

export default ContentVerse;

const styles = StyleSheet.create({
  container: {
  },
  title: {
    color: "#777",
    textTransform: "lowercase",
    left: -10,
  },
  text: {}
});
