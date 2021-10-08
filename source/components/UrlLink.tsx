import React from "react";
import { Linking, StyleSheet, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { rollbar } from "../scripts/rollbar";

const UrlLink: React.FC<{ url: string, style?: Array<Object> | Object }> = ({ children, url, style = [] }) => {
  const open = () => {
    Linking.canOpenURL(url)
      .then(isSupported => {
        if (isSupported) {
          Linking.openURL(url);
        } else {
          rollbar.warning("Can't open URL '" + url + "': not supported");
        }
      });
  };

  return (
    <View style={style}>
      <TouchableOpacity onPress={open}>
        <View>
          {children}
        </View>
      </TouchableOpacity>
    </View>);
};

export default UrlLink;

const styles = StyleSheet.create({
  url: {
    color: "dodgerblue"
  }
});

export const urlLinkStyle = styles.url;
