import React from "react";
import { Alert, View, TouchableOpacity } from "react-native";
import { openLink } from "../../logic/utils";

const UrlLink: React.FC<{
  url: string,
  style?: Array<Object> | Object,
  onOpened?: () => void
}> =
  ({
     children,
     url,
     style = [],
     onOpened
   }) => {
    const open = () => {
      openLink(url)
        .then(onOpened)
        .catch(e => Alert.alert("Error opening link", e.message))
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

