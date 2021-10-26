import React, { ReactElement } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface ComponentProps {
  icon: string | ReactElement;
  onPress?: () => void;
}

const HeaderIconButton: React.FC<ComponentProps> = ({ icon, onPress }) => {
  if (typeof icon === "string") {
    icon = <Icon name={icon} style={styles.icon}/>
  }

  return (<TouchableOpacity onPress={onPress} style={styles.container}>
    {icon}
  </TouchableOpacity>);
};

export default HeaderIconButton;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  icon: {
    fontSize: 20,
  }
});
