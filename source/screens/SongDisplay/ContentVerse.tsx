import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ContentVerseProps {
  title: string;
  content: string;
  scale: number;
}

const ContentVerse: React.FC<ContentVerseProps> = ({ title, content, scale }) => {
  const scalableStyles = StyleSheet.create({
    title: {
      fontSize: 14 * scale
    },
    text: {
      fontSize: 18 * scale,
      lineHeight: 30 * scale
    }
  });

  return (
    <View style={styles.container}>
      {title === "" ? null :
        <Text style={[styles.title, scalableStyles.title]}>{title}</Text>}
      <Text style={[styles.text, scalableStyles.text]}>{content}</Text>
    </View>
  );
};

export default ContentVerse;

const styles = StyleSheet.create({
  container: {
    marginBottom: 50
  },
  title: {
    color: "#777",
    textTransform: "lowercase",
    left: -10,
    marginBottom: 7,
  },
  text: {},
});
