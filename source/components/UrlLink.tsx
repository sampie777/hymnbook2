import React, { useState } from "react";
import { Alert, View, TouchableOpacity } from "react-native";
import { openLink } from "../scripts/utils";
import { isEmulator } from "react-native-device-info";

const UrlLink: React.FC<{
  url: string,
  style?: Array<Object> | Object,
  onOpened?: () => void,
  workWithEmulator?: boolean
}> =
  ({
     children,
     url,
     style = [],
     onOpened,
     workWithEmulator = true
   }) => {
    const [_isEmulator, setIsEmulator] = useState(true);
    isEmulator().then(isEmulator => setIsEmulator(isEmulator));

    const open = () => {
      if (!workWithEmulator && _isEmulator) {
        return;
      }

      openLink(url)
        .then(onOpened)
        .catch(e => Alert.alert("Error opening link", e.message));
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

