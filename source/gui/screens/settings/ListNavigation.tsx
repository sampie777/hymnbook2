import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider.tsx";
import Icon from "react-native-vector-icons/FontAwesome5";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface Props {
  headerVerticalPositions: { [key: string]: number }
  onItemPress: (title: string, y: number) => void
}

const ListNavigation: React.FC<Props> = ({ headerVerticalPositions, onItemPress }) => {
  const [visible, setVisible] = useState(false);
  const styles = createStyles(useTheme());
  const animationValue = useSharedValue(0);
  const [listHeight, setListHeight] = useState(0);
  const [items, setItems] = useState<[string, number][]>([])

  useEffect(() => {
    const sortedList = Object.entries(headerVerticalPositions)
      .sort((a, b) => a[1] - b[1])

    if (sortedList.length == 0) return;

    setItems(sortedList)
  }, [headerVerticalPositions]);

  const toggleVisibility = () => setVisible(!visible);

  useEffect(() => {
    animationValue.value = withTiming(visible ? 1 : 0, {
      duration: 200,
    });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: (animationValue.value - 1) * listHeight,
    opacity: animationValue.value * 2 - 1,
    position: animationValue.value == 0 ? "absolute" : "relative",
  }), [listHeight])

  const onPress = (title: string, y: number) => {
    setVisible(false);
    onItemPress(title, y);
  }

  return <View style={styles.container}>
    <TouchableOpacity style={styles.header}
                      onPress={toggleVisibility}>
      <Icon name={"bars"} style={[styles.headerText, styles.headerIcon]} />
      <Text style={styles.headerText}>Navigation</Text>
    </TouchableOpacity>

    <Animated.View style={[styles.list, animatedStyle]}
                   onLayout={event => setListHeight(event.nativeEvent.layout.height)}>
      {items.map(it =>
        <TouchableOpacity key={it[0]}
                          onPress={() => onPress(it[0], it[1])}>
          <Text style={styles.text}>{it[0]}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  </View>;
};

export default ListNavigation;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
    zIndex: 100,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  header: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surface2,
  },
  headerIcon: {},
  headerText: {
    color: colors.text.light,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 10,
  },

  list: {
    backgroundColor: colors.surface2,
    borderBottomWidth: 1,
    borderColor: colors.border.lightVariant,
    paddingBottom: 20,
    paddingHorizontal: 20,
    zIndex: -1,
  },

  text: {
    marginLeft: 25,
    paddingVertical: 5,
    fontWeight: "bold",
    fontSize: 15,
    textTransform: "uppercase",
    color: "#999"
  }
});