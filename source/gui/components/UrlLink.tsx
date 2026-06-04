import React, { PropsWithChildren } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import { openLink } from "../../logic/utils/utils.ts";
import SafeText from "./SafeText.tsx";

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
      return <SafeText onPress={open}
                   importantForAccessibility={"auto"}>
        {children}
      </SafeText>;
    }

    return <View style={style}>
      <TouchableOpacity onPress={open}>
        {children}
      </TouchableOpacity>
    </View>;
  };

export default UrlLink;

