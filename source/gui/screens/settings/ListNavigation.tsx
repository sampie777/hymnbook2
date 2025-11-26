import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider.tsx";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  headerVerticalPositions: { [key: string]: number }
  onItemPress: (title: string, y: number) => void
}

const ListNavigation: React.FC<Props> = ({ headerVerticalPositions, onItemPress }) => {
  const [visible, setVisible] = useState(false);
  const styles = createStyles(useTheme());

  const sortedList = Object.entries(headerVerticalPositions)
    .sort((a, b) => a[1] - b[1])

  const toggleVisibility = () => setVisible(!visible);

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

    <View>
      {visible && <View style={styles.list}>
        {sortedList.map(it =>
          <TouchableOpacity key={it[0]}
                            onPress={() => onPress(it[0], it[1])}>
            <Text style={styles.text}>{it[0]}</Text>
          </TouchableOpacity>
        )}
      </View>}
    </View>
  </View>;
};

const styles = StyleSheet.create({
  container: {},
});

export default ListNavigation;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderColor: colors.border.lightVariant,
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
    paddingBottom: 25,
    paddingHorizontal: 20,
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