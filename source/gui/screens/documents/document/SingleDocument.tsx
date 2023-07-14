import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent, View,
  ScrollView as NativeScrollView
} from "react-native";
import Db from "../../../../logic/db/db";
import Settings from "../../../../settings";
import { rollbar } from "../../../../logic/rollbar";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DocumentSchema } from "../../../../logic/db/models/DocumentsSchema";
import { Document } from "../../../../logic/db/models/Documents";
import { useFocusEffect } from "@react-navigation/native";
import { ThemeContextProps, useTheme } from "../../../components/ThemeProvider";
import { isIOS, keepScreenAwake } from "../../../../logic/utils";
import { DocumentRoute, ParamList } from "../../../../navigation";
import {
  GestureEvent, PinchGestureHandler, PinchGestureHandlerEventPayload, ScrollView as GestureScrollView, State
} from "react-native-gesture-handler";
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
import OriginalHtmlViewer from "../../../components/htmlView/OriginalHtmlViewer";

const Footer: React.FC<{ opacity: SharedValue<number> }> =
  ({ opacity }) => {
    const styles = createStyles(useTheme());
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value
    }));

    return <Animated.View style={[styles.container, animatedStyle]} />;
  };

const SingleDocument: React.FC<NativeStackScreenProps<ParamList, typeof DocumentRoute>> = ({ route, navigation }) => {
  const pinchGestureHandlerRef = useRef<PinchGestureHandler>();
  const scrollViewComponent = useRef<NativeScrollView | GestureScrollView>(null);
  const fadeInFallbackTimeout = useRef<NodeJS.Timeout | undefined>();
  const htmlViewLastLoadedForDocumentId = useRef<number | undefined>();

  const [document, setDocument] = useState<Document & Realm.Object | undefined>(undefined);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(999);
  const [onPressed, setOnPressed] = useState(false);
  const animatedOpacity = useSharedValue(0);
  const animatedScale = Animated.useValue<number>(0.95 * Settings.documentScale);

  const theme = useTheme();
  const styles = createStyles(theme);
  const animatedStyle = {
    htmlViewContainer: useAnimatedStyle(() => ({
      opacity: animatedOpacity.value
    }))
  };

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
    animatedOpacity.value = 0;

    // Set fallback timer for fading in document screen
    if (fadeInFallbackTimeout.current !== undefined) {
      clearTimeout(fadeInFallbackTimeout.current);
    }
    fadeInFallbackTimeout.current = setTimeout(() => {
      rollbar.warning("Document loading timed out", {
        documentId: document?.id ?? "null",
        SettingsSongFadeIn: Settings.songFadeIn
      });
      onHtmlViewLoaded();
    }, 3000);
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
      clearTimeout(fadeInFallbackTimeout.current);
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

  const _onPanGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (!Settings.documentsUseExperimentalViewer) return;
    animatedScale.setValue(Settings.documentScale * event.nativeEvent.scale);
  };

  const _onPinchHandlerStateChange = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (!Settings.documentsUseExperimentalViewer) return;
    if (event.nativeEvent.state === State.END) {
      animatedScale.setValue(Settings.documentScale * event.nativeEvent.scale);
      Settings.documentScale *= event.nativeEvent.scale;
    }
  };

  const HtmlView = useMemo(() =>
      Settings.documentsUseExperimentalViewer
        ? <AnimatedHtmlView html={document?.html ?? ""}
                            scale={animatedScale}
                            onLayout={onHtmlViewLoaded} />
        : <OriginalHtmlViewer html={document?.html ?? ""}
                              onLayout={onHtmlViewLoaded} />,
    [document?.id]);

  const ScrollView = Settings.useNativeFlatList ? NativeScrollView : GestureScrollView;

  return <PinchGestureHandler ref={pinchGestureHandlerRef}
                              onGestureEvent={_onPanGestureEvent}
                              onHandlerStateChange={_onPinchHandlerStateChange}>
    <View style={styles.container}>
      <DocumentControls navigation={navigation}
                        document={document}
                        forceShow={onPressed}
                        scrollOffset={scrollOffset}
                        bottomOffset={bottomOffset} />

      {document === undefined ? undefined :
        <ScrollView
          ref={scrollViewComponent}
          waitFor={isIOS ? undefined : pinchGestureHandlerRef}
          onScroll={onScrollViewScroll}
          scrollEventThrottle={200}
          onTouchStart={onScrollViewTouchStart}
          onTouchMove={onScrollViewTouchMove}
          onTouchCancel={onScrollViewTouchCancel}
          onTouchEnd={onScrollViewTouchEnd}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.contentSectionList}>

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
  </PinchGestureHandler>;
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
