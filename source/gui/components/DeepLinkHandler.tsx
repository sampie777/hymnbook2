import React, { useEffect, useRef } from "react";
import { EmitterSubscription, Linking } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { DatabasesRoute, ParamList } from "../../navigation";
import { Types } from "../screens/downloads/TypeSelectBar";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { deepLinkPathToSegments, deepLinkValidatePath } from "../../logic/app";
import { rollbar } from "../../logic/rollbar";
import config from "../../config";

interface Props {
  children: React.ReactNode;
}

const DeepLinkHandler: React.FC<Props> = ({ children }) => {
  const linkingEventListener = useRef<EmitterSubscription | undefined>();
  const navigation = useNavigation<NativeStackNavigationProp<ParamList, any>>();

  useEffect(() => {
    Linking.getInitialURL().then(handleDeepLink);
    linkingEventListener.current?.remove();
    linkingEventListener.current = Linking.addEventListener("url", ({ url }) => handleDeepLink(url));

    return () => {
      linkingEventListener.current?.remove();
    };
  });

  const handleDeepLink = (url: string | null) => {
    if (!url) return;

    if (!deepLinkValidatePath(url)) {
      rollbar.warning("Received invalid deep link", {
        url: url,
        deepLinkPaths: config.deepLinkPaths
      });
      return;
    }

    const path = deepLinkPathToSegments(url);
    if (path.length === 0) return;

    switch (path[0]) {
      case "download":
        if (path.length < 3) return;
        switch (path[1].toLowerCase()) {
          case "songs":
            rollbar.debug("Handling deep link", { url: url });
            return navigation.navigate(DatabasesRoute, { type: Types.Songs, promptForUuid: path[2] });
          case "documents":
            rollbar.debug("Handling deep link", { url: url });
            return navigation.navigate(DatabasesRoute, { type: Types.Documents, promptForUuid: path[2] });
        }
        break;
    }
  };

  return <>{children}</>;
};

export default DeepLinkHandler;
