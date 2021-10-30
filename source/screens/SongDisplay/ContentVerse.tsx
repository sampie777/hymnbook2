import React from "react";
import { StyleSheet } from "react-native";
import Animated  from "react-native-reanimated";

interface ContentVerseProps {
  title: string;
  content: string;
  scale: Animated.Value<number>;
  opacity: Animated.Value<number>;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ title, content, scale, opacity }) => {

  const animatedStyle = {
    container: {
      marginTop: Animated.multiply(scale, 15),
      marginBottom: Animated.multiply(scale, 35),
      opacity: opacity
    },
    title: {
      fontSize: Animated.multiply(scale, 14),
      marginBottom: Animated.multiply(scale, 7)
    },
    text: {
      fontSize: Animated.multiply(scale, 20),
      lineHeight: Animated.multiply(scale, 30)
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle.container]}>
      {title === "" ? null :
        <Animated.Text style={[styles.title, animatedStyle.title]}>{title}</Animated.Text>}
      <Animated.Text style={[styles.text, animatedStyle.text]}>{content}</Animated.Text>
    </Animated.View>
  );
};

export default ContentVerse;

const styles = StyleSheet.create({
  container: {},
  title: {
    color: "#777",
    textTransform: "lowercase",
    left: -10
  },
  text: {}
});
