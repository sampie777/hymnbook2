import React, { ReactNode, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent
} from "react-native";
import Db from "../../../../logic/db/db";
import Settings from "../../../../settings";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DocumentSchema } from "../../../../logic/db/models/DocumentsSchema";
import { Document } from "../../../../logic/db/models/Documents";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { keepScreenAwake } from "../../../../logic/utils";
import { DocumentRoute, ParamList } from "../../../../navigation";
import {
  GestureHandlerRootView
} from "react-native-gesture-handler";
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import HTMLView, { HTMLViewNode, HTMLViewNodeRenderer } from "react-native-htmlview";
import LoadingOverlay from "../../../components/LoadingOverlay";
import DocumentControls from "./DocumentControls";

const Footer: React.FC<{ opacity: SharedValue<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value
    }));

    return <Animated.View style={[styles.container, animatedStyle]} />;
  };

const SingleDocument: React.FC<NativeStackScreenProps<ParamList, typeof DocumentRoute>> = ({ route, navigation }) => {
  const scrollViewComponent = useRef<ScrollView>(null);
  const [document, setDocument] = useState<Document & Realm.Object | undefined>(undefined);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(999);
  const [onPressed, setOnPressed] = useState(false);
  const animatedOpacity = useSharedValue(0);
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
  };

  useEffect(() => {
    if (Settings.songFadeIn) {
      animate();
    } else {
      animatedOpacity.value = 1;
    }

    // Use small timeout for scrollToTop to prevent scroll being stuck / not firing..
    setTimeout(() => scrollToTop(), 150);
  }, [document?.id]);

  React.useLayoutEffect(() => {
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
  };

  const animate = () => {
    animatedOpacity.value = 0;
    animatedOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.inOut(Easing.ease)
    });
  };

  const scrollToTop = () => {
    scrollViewComponent.current?.scrollTo({
      y: 0,
      animated: Settings.animateScrolling
    });
  };

  const onScrollViewScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setOnPressed(false);
    setScrollOffset(e.nativeEvent.contentOffset.y);
    setBottomOffset(e.nativeEvent.contentSize.height - e.nativeEvent.layoutMeasurement.height - e.nativeEvent.contentOffset.y);
  };

  /*
   *  Register a single touch event on the scroll view
   */
  const staticTouchStarted = useRef(false);
  const staticTouchStartX = useRef(0);
  const staticTouchStartY = useRef(0);

  const onScrollViewTouchStart = (event: GestureResponderEvent) => {
    staticTouchStarted.current = true;
    staticTouchStartX.current = event.nativeEvent.locationX;
    staticTouchStartY.current = event.nativeEvent.locationY;
  };

  const onScrollViewTouchMove = (event: GestureResponderEvent) => {
    const diffX = Math.abs(staticTouchStartX.current - event.nativeEvent.locationX);
    const diffY = Math.abs(staticTouchStartY.current - event.nativeEvent.locationY);
    if (diffX > 5 || diffY > 5) {
      staticTouchStarted.current = false;
    }
  };

  const onScrollViewTouchCancel = () => staticTouchStarted.current = false;

  const onScrollViewTouchEnd = () => {
    if (!staticTouchStarted.current) {
      return;
    }
    staticTouchStarted.current = false;
    setOnPressed(true);
  };

  const renderNode = (
    node: HTMLViewNode,
    index: number,
    siblings: HTMLViewNode[],
    parent: HTMLViewNode,
    defaultRenderer: HTMLViewNodeRenderer): ReactNode | undefined => {
    if (node.name === "sup") {
      // Disable auto removing empty views (collapsable=false),
      // as it causes https://trello.com/c/lgysuHsN/79-bug-some-document-transitions-let-the-app-crash
      return <View key={index}
                   collapsable={false}>
        {defaultRenderer(node.children, node)}
      </View>;
    } else if (node.name === "span") {
      return defaultRenderer(node.children, node);
    }
    return undefined;
  };

  return <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>

        <DocumentControls navigation={navigation}
                          document={document}
                          forceShow={onPressed}
                          scrollOffset={scrollOffset}
                          bottomOffset={bottomOffset} />

        {document === undefined ? undefined :
          <ScrollView
            ref={scrollViewComponent}
            onScroll={onScrollViewScroll}
            onTouchStart={onScrollViewTouchStart}
            onTouchMove={onScrollViewTouchMove}
            onTouchCancel={onScrollViewTouchCancel}
            onTouchEnd={onScrollViewTouchEnd}
            showsVerticalScrollIndicator={true}
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
    </GestureHandlerRootView>;
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
