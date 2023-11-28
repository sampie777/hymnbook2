import React, { PropsWithChildren } from "react";
import { Alert, View, TouchableOpacity, Text } from "react-native";
import { openLink } from "../../logic/utils";

const UrlLink: React.FC<PropsWithChildren<{
  url: string,
  style?: Array<Object> | Object,
  onOpened?: () => void,
  textOnly?: boolean,
}>> =
  ({
     children,
     url,
     style = [],
     onOpened,
     textOnly = false
   }) => {
    const open = () => {
      openLink(url)
        .then(onOpened)
        .catch(e => Alert.alert("Error opening link", e.message));
    };

    if (textOnly) {
      return <Text onPress={open}>{children}</Text>;
    }

    return <View style={style}>
      <TouchableOpacity onPress={open}>
        {children}
      </TouchableOpacity>
    </View>;
  };

export default UrlLink;

