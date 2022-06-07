import React, { ReactNode, useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, View, Platform, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import Db from "../../../logic/db/db";
import Settings from "../../../settings";
import { NativeStackScreenProps } from "react-native-screens/src/native-stack/types";
import { DocumentSchema } from "../../../logic/db/models/DocumentsSchema";
import { Document } from "../../../logic/db/models/Documents";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { keepScreenAwake } from "../../../logic/utils";
import { ParamList } from "../../../navigation";
import {
  GestureHandlerRootView
} from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import HTMLView, { HTMLViewNode } from "react-native-htmlview";
import LoadingOverlay from "../../components/LoadingOverlay";
import DocumentControls from "./DocumentControls";

const Footer: React.FC<{ opacity: Animated.Value<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = {
      container: {
        opacity: opacity
      }
    };

    return (<Animated.View style={[styles.container, animatedStyle.container]} />);
  };

const SingleDocument: React.FC<NativeStackScreenProps<ParamList, "Document">> = ({ route, navigation }) => {
  const scrollViewComponent = useRef<ScrollView>();
  const [document, setDocument] = useState<Document & Realm.Object | undefined>(undefined);
  const [scrollOffset, setScrollOffset] = useState(0);
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

  const renderNode = (
    node: HTMLViewNode & { children: any },
    index: number,
    siblings: HTMLViewNode,
    parent: HTMLViewNode,
    defaultRenderer: (node: HTMLViewNode, parent: HTMLViewNode) => ReactNode): ReactNode | undefined => {
    if (node.name === "sup") {
      return <View key={index}>
        {defaultRenderer(node.children, node)}
      </View>;
    } else if (node.name === "span") {
      return defaultRenderer(node.children, node);
    }
    return undefined;
  };

  const onScrollViewScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(e.nativeEvent.contentOffset.y);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        <DocumentControls navigation={navigation}
                          document={document}
                          scrollOffset={scrollOffset} />

        {document === undefined ? undefined :
          <ScrollView
            // @ts-ignore
            ref={scrollViewComponent}
            onScroll={onScrollViewScroll}
            contentContainerStyle={styles.contentSectionList}>

            <HTMLView value={document.html.replace(/\n/gi, "")}
                      paragraphBreak={""}
                      renderNode={renderNode}
                      stylesheet={styles} />

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
    paddingLeft: 15,
    paddingTop: 15,
    paddingRight: 10,
    paddingBottom: 200
  },
  footer: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 100,
    marginBottom: 100,
    alignSelf: "center"
  },

  p: {
    color: colors.text,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale
  },
  h1: {
    color: colors.text,
    fontSize: 38 * Settings.songScale,
    lineHeight: 50 * Settings.songScale,
    paddingTop: 10 * Settings.songScale,
    marginBottom: -30 * Settings.songScale,
    fontWeight: "bold"
  },
  h2: {
    color: colors.text,
    fontSize: 32 * Settings.songScale,
    lineHeight: 50 * Settings.songScale,
    paddingTop: 20 * Settings.songScale,
    marginBottom: -30 * Settings.songScale,
    fontWeight: "bold"
  },
  h3: {
    color: colors.text,
    fontSize: 26 * Settings.songScale,
    lineHeight: 45 * Settings.songScale,
    paddingTop: 20 * Settings.songScale,
    marginBottom: -25 * Settings.songScale,
    fontWeight: "bold"
  },
  h4: {
    color: colors.text,
    fontSize: 20 * Settings.songScale,
    lineHeight: 40 * Settings.songScale,
    paddingTop: 15 * Settings.songScale,
    marginBottom: -18 * Settings.songScale,
    fontWeight: "bold"
  },
  h5: {
    color: colors.text,
    fontSize: 18 * Settings.songScale,
    lineHeight: 35 * Settings.songScale,
    paddingTop: 15 * Settings.songScale,
    marginBottom: -20 * Settings.songScale,
    fontWeight: "bold"
  },
  h6: {
    color: colors.text,
    fontSize: 12 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    paddingTop: 10 * Settings.songScale,
    fontWeight: "bold"
  },
  ul: {
    color: colors.text,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    marginVertical: 10 * Settings.songScale
  },
  ol: {
    color: colors.text,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    marginVertical: 10 * Settings.songScale
  },
  pre: {
    color: colors.text,
    fontSize: 19 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },

  blockquote: {
    color: colors.text,
    fontSize: 20 * Settings.songScale,
    lineHeight: 30 * Settings.songScale,
    borderLeftWidth: 5,
    borderLeftColor: colors.borderVariant,
    paddingLeft: 30,
    paddingVertical: 15 * Settings.songScale,
    marginVertical: 15 * Settings.songScale
  },
  code: {
    fontSize: 19 * Settings.songScale,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace"
  },
  ins: {
    textDecorationLine: "underline"
  },
  del: {
    textDecorationLine: "line-through"
  },
  sup: {
    fontSize: 13 * Settings.songScale
  },
  sub: {
    fontSize: 13 * Settings.songScale
  },
  hr: {
    borderBottomWidth: 1,
    borderBottomColor: "#555"
  }
});
