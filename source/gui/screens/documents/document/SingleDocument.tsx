import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  GestureResponderEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView as NativeScrollView,
  StyleSheet,
  View
} from "react-native";
import Settings from "../../../../settings";
import { rollbar } from "../../../../logic/rollbar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Document } from "../../../../logic/db/models/documents/Documents";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { keepScreenAwake } from "../../../../logic/utils";
import { DocumentRoute, ParamList } from "../../../../navigation";
import { Gesture, GestureDetector, ScrollView as GestureScrollView, } from "react-native-gesture-handler";
import Animated, {
  Easing,
  runOnJS,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import LoadingOverlay from "../../../components/LoadingOverlay";
import DocumentControls from "./DocumentControls";
import DocumentBreadcrumb from "./DocumentsBreadcrumb";
import AnimatedHtmlView from "../../../components/htmlView/AnimatedHtmlView";
import useHistory from "../../../../logic/documents/history/useHistory";
import { loadDocumentWithUuidOrId } from "../../../../logic/documents/utils";

const Footer: React.FC<{ opacity: SharedValue<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value
    }));

    return <Animated.View style={[styles.container, animatedStyle]} />;
  };

const SingleDocument: React.FC<NativeStackScreenProps<ParamList, typeof DocumentRoute>> = ({ route, navigation }) => {
  const scrollViewComponent = useRef<NativeScrollView | GestureScrollView>(null);
  const fadeInFallbackTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const htmlViewLastLoadedForDocumentId = useRef<number | undefined>(undefined);

  const [document, setDocument] = useState<Document | undefined>(undefined);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(999);
  const [onPressed, setOnPressed] = useState(false);

  useHistory(document);

  const animatedOpacity = useSharedValue(0);
  // Use a `SharedValue` so this value is accesible on the UI thread
  const baseScale = useSharedValue(Settings.documentScale);
  const animatedScale = useSharedValue(0.95 * baseScale.value);

  const theme = useTheme();
  const styles = createStyles(theme);
  const animatedStyle = {
    htmlViewContainer: useAnimatedStyle(() => ({
      opacity: animatedOpacity.value
    }))
  };

  useFocusEffect(useCallback(() => {
    onFocus();
    return onBlur;
  }, [route.params.id]));

  const onFocus = () => {
    keepScreenAwake(Settings.keepScreenAwake);
    loadDocument();
  };

  const onBlur = () => {
    keepScreenAwake(false);
    setDocument(undefined);
  };

  useEffect(() => {
    animatedOpacity.value = 0;

    // Set fallback timer for fading in document screen
    if (fadeInFallbackTimeout.current !== undefined) {
      clearTimeout(fadeInFallbackTimeout.current!);
    }
    fadeInFallbackTimeout.current = setTimeout(() => {
      rollbar.warning("Document loading timed out", {
        document: { ...document, _parent: null, html: null },
        SettingsSongFadeIn: Settings.songFadeIn
      });
      onHtmlViewLoaded();
    }, 3000);
  }, [document?.id]);

  useLayoutEffect(() => {
    if (document == undefined) {
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
    const dbDocument = loadDocumentWithUuidOrId(route.params.uuid, route.params.id)
    setDocument(dbDocument ? Document.clone(dbDocument, { includeParent: true }) : undefined);

    if (!dbDocument) {
      Alert.alert("Document could not be found", "This probably happened because the database was updated. Try re-opening the document.")
      rollbar.info("Document could not be found", {
        "route.params.id": route.params.id,
        "route.params.uuid": route.params.uuid,
      })
    }
  };

  const animate = (callback?: () => void) => {
    animatedOpacity.value = withTiming(1, {
      duration: 180,
      easing: Easing.inOut(Easing.ease)
    }, () => callback ? runOnJS(callback)() : undefined);
  };

  const scrollToTop = () => {
    scrollViewComponent.current?.scrollTo({
      y: 0,
      animated: Settings.animateScrolling
    });
  };

  const onHtmlViewLoaded = () => {
    if (fadeInFallbackTimeout.current !== undefined) {
      clearTimeout(fadeInFallbackTimeout.current!);
    }

    const afterDisplay = () => {
      // Don't jump to top when we're still on the same document, as this
      // method will also be called after a zoom event.
      if (document?.id == htmlViewLastLoadedForDocumentId.current) return;
      htmlViewLastLoadedForDocumentId.current = document?.id;

      scrollToTop();
    };

    if (Settings.songFadeIn) {
      animate(afterDisplay);
    } else {
      // Use small delay so the text doesn't jump around due to Animation scale.
      setTimeout(() => {
        animatedOpacity.value = 1;
        afterDisplay();
      }, 30);
    }
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

  const storeNewScaleValue = (scale: number) =>
    Settings.documentScale *= scale;

  const pinchGesture = useMemo(() =>
      Gesture.Pinch()
        .onUpdate((event) => {
          animatedScale.value = baseScale.value * event.scale;
        })
        .onEnd((event) => {
          animatedScale.value = baseScale.value * event.scale;
          runOnJS(storeNewScaleValue)(event.scale);
        })
    , [])

  const HtmlView = useMemo(() => <AnimatedHtmlView html={document?.html ?? ""}
                                                   scale={animatedScale}
                                                   onLayout={onHtmlViewLoaded} />,
    [document?.id]);

  const ScrollView = Settings.useNativeFlatList ? NativeScrollView : GestureScrollView;

  return <GestureDetector gesture={pinchGesture}>
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
          scrollEventThrottle={200}
          onTouchStart={onScrollViewTouchStart}
          onTouchMove={onScrollViewTouchMove}
          onTouchCancel={onScrollViewTouchCancel}
          onTouchEnd={onScrollViewTouchEnd}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.contentSectionList}
          removeClippedSubviews={false}>

          <DocumentBreadcrumb document={document} scale={animatedScale} />

          <Animated.View style={animatedStyle.htmlViewContainer}>
            {HtmlView}
          </Animated.View>

          <Footer opacity={animatedOpacity} />
        </ScrollView>
      }

      <LoadingOverlay text={null}
                      isVisible={
                        route.params.id !== undefined
                        && (document === undefined || document.id !== route.params.id)}
                      animate={Settings.songFadeIn} />
    </View>
  </GestureDetector>;
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
    borderTopColor: colors.border.default,
    borderTopWidth: 1,
    width: "50%",
    marginTop: 100,
    marginBottom: 100,
    alignSelf: "center"
  }
});
