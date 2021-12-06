import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import {
  GestureHandlerRootView
} from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import Db from "../../scripts/db/db";
import Settings from "../../scripts/settings/settings";
import { DocumentSchema } from "../../models/DocumentsSchema";
import { Document } from "../../models/Documents";
import { keepScreenAwake } from "../../scripts/utils";
import LoadingOverlay from "../../components/LoadingOverlay";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import HTMLView from "react-native-htmlview";

const Footer: React.FC<{ opacity: Animated.Value<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = {
      footer: {
        opacity: opacity
      }
    };

    return (<Animated.View style={[styles.footer, animatedStyle.footer]} />);
  };

interface DocumentDisplayScreenProps {
  route: any;
  navigation: NativeStackNavigationProp<any>;
}

const SingleDocument: React.FC<DocumentDisplayScreenProps> = ({ route, navigation }) => {
  const scrollViewComponent = useRef<ScrollView>();
  const [document, setDocument] = useState<Document & Realm.Object | undefined>(undefined);
  const animatedOpacity = new Animated.Value<number>(1);
  const styles = createStyles(useTheme());

  useFocusEffect(
    React.useCallback(() => {
      onFocus();
      return onBlur;
    }, [route.params.id])
  );

  const onFocus = () => {
    keepScreenAwake(Settings.keepScreenAwake);
    loadDocument();
  };

  const onBlur = () => {
    keepScreenAwake(false);
    setDocument(undefined);
    navigation.setOptions({
      title: ""
    });
  };

  useEffect(() => {
    if (Settings.songFadeIn) {
      animate();
    } else {
      animatedOpacity.setValue(1);
    }

    // Use small timeout for scrollToTop to prevent scroll being stuck / not firing..
    setTimeout(() => scrollToTop(), 150);
  }, [document?.id]);

  useEffect(() => {
    if (document === undefined) {
      navigation.setOptions({
        title: ""
      });
      return;
    }

    navigation.setOptions({
      title: document.name
    });
  }, [document?.name]);

  const loadDocument = () => {
    if (!Db.documents.isConnected()) {
      return;
    }

    if (route.params.id === undefined) {
      setDocument(undefined);
      return;
    }

    const newDocument = Db.documents.realm()
      .objectForPrimaryKey(DocumentSchema.name, route.params.id) as (Document & Realm.Object | undefined);

    if (newDocument === undefined) {
      // Document not found
    }

    setDocument(newDocument);
    navigation.setOptions({
      title: newDocument?.name
    });
  };

  const animate = () => {
    animatedOpacity.setValue(0);
    Animated.timing(animatedOpacity, {
      toValue: 1,
      duration: 180,
      easing: Easing.inOut(Easing.ease)
    })
      .start();
  };

  const scrollToTop = () => {
    scrollViewComponent.current?.scrollTo({
      y: 0,
      animated: Settings.animateScrolling
    });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        {document === undefined ? undefined :
          <ScrollView
            // @ts-ignore
            ref={scrollViewComponent}
            contentContainerStyle={styles.contentSectionList}>


            <HTMLView value={document.html}
                      stylesheet={{
                        p: {
                          color: styles.text.color,
                          fontSize: 20 * Settings.songScale,
                          lineHeight: 30 * Settings.songScale
                        }
                      }} />

            <Footer opacity={animatedOpacity} />
          </ScrollView>
        }

        <LoadingOverlay text={null}
                        isVisible={
                          route.params.id !== undefined
                          && (document === undefined || document.id !== route.params.id)}
                        animate={Settings.songFadeIn} />
      </View>
    </GestureHandlerRootView>
  );
};

export default SingleDocument;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  contentSectionList: {
    paddingLeft: 30,
    paddingTop: 5,
    paddingRight: 20,
    paddingBottom: 200
  },

  text: {
    color: colors.text
  },

  footer: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 70,
    marginBottom: 100,
    alignSelf: "center"
  }
});
