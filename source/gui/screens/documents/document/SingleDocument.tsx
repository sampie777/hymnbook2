import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
  GestureResponderEvent, View
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
  GestureEvent,
  GestureHandlerRootView, PinchGestureHandler, PinchGestureHandlerEventPayload, ScrollView, State
} from "react-native-gesture-handler";
import Animated, { Easing, SharedValue, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import LoadingOverlay from "../../../components/LoadingOverlay";
import DocumentControls from "./DocumentControls";
import DocumentBreadcrumb from "./DocumentsBreadcrumb";
import AnimatedHtmlView from "../../../components/htmlView/AnimatedHtmlView";

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
  const scrollViewComponent = useRef<ScrollView>(null);
  const [document, setDocument] = useState<Document & Realm.Object | undefined>(undefined);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [bottomOffset, setBottomOffset] = useState(999);
  const [onPressed, setOnPressed] = useState(false);
  const animatedOpacity = useSharedValue(0);

  const theme = useTheme();
  const styles = createStyles(theme);
  const htmlStyles = useMemo(() => createHtmlStyles(theme), [theme]);
  const animatedScale = Animated.useValue<number>(1);
  const animatedHtmlStyles = {
    p: {
      fontSize: Animated.multiply(animatedScale, 20),
      lineHeight: Animated.multiply(animatedScale, 30)
    },
    h1: {
      fontSize: Animated.multiply(animatedScale, 38),
      lineHeight: Animated.multiply(animatedScale, 50),
      paddingTop: Animated.multiply(animatedScale, 10),
      marginBottom: Animated.multiply(animatedScale, 20)
    },
    h2: {
      fontSize: Animated.multiply(animatedScale, 32),
      lineHeight: Animated.multiply(animatedScale, 50),
      paddingTop: Animated.multiply(animatedScale, 25),
      marginBottom: Animated.multiply(animatedScale, 10)
    },
    h3: {
      fontSize: Animated.multiply(animatedScale, 22),
      lineHeight: Animated.multiply(animatedScale, 40),
      paddingTop: Animated.multiply(animatedScale, 30),
      marginBottom: Animated.multiply(animatedScale, 10)
    },
    h4: {
      fontSize: Animated.multiply(animatedScale, 20),
      lineHeight: Animated.multiply(animatedScale, 35),
      paddingTop: Animated.multiply(animatedScale, 25),
      marginBottom: Animated.multiply(animatedScale, 10)
    },
    h5: {
      fontSize: Animated.multiply(animatedScale, 18),
      lineHeight: Animated.multiply(animatedScale, 30),
      paddingTop: Animated.multiply(animatedScale, 15),
      marginBottom: Animated.multiply(animatedScale, 20)
    },
    h6: {
      fontSize: Animated.multiply(animatedScale, 16),
      lineHeight: Animated.multiply(animatedScale, 25),
      paddingTop: Animated.multiply(animatedScale, 10)
    },
    ul: {
      marginVertical: Animated.multiply(animatedScale, 20)
    },
    ol: {
      marginVertical: Animated.multiply(animatedScale, 20)
    },
    liText: {
      fontSize: Animated.multiply(animatedScale, 20),
      lineHeight: Animated.multiply(animatedScale, 30)
    },
    pre: {
      fontSize: Animated.multiply(animatedScale, 19),
      lineHeight: Animated.multiply(animatedScale, 30)
    },
    blockquote: {
      fontSize: Animated.multiply(animatedScale, 20),
      lineHeight: Animated.multiply(animatedScale, 30),
      paddingVertical: Animated.multiply(animatedScale, 15),
      marginVertical: Animated.multiply(animatedScale, 15)
    },
    code: {
      fontSize: Animated.multiply(animatedScale, 19)
    },
    sup: {
      fontSize: Animated.multiply(animatedScale, 13)
    },
    sub: {
      fontSize: Animated.multiply(animatedScale, 13)
    }
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

  const _onPanGestureEvent = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    animatedScale.setValue(Settings.documentScale * event.nativeEvent.scale);
  };

  const _onPinchHandlerStateChange = (event: GestureEvent<PinchGestureHandlerEventPayload>) => {
    if (event.nativeEvent.state === State.END) {
      animatedScale.setValue(Settings.documentScale * event.nativeEvent.scale);
      Settings.documentScale *= event.nativeEvent.scale;
    }
  };

  const HtmlView = useMemo(() => <AnimatedHtmlView html={document?.html ?? ""}
                                                   styles={[htmlStyles, animatedHtmlStyles]} />, [document?.id]);

  return <GestureHandlerRootView style={{ flex: 1 }}>
    <PinchGestureHandler
      ref={pinchGestureHandlerRef}
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
            waitFor={pinchGestureHandlerRef}
            onScroll={onScrollViewScroll}
            onTouchStart={onScrollViewTouchStart}
            onTouchMove={onScrollViewTouchMove}
            onTouchCancel={onScrollViewTouchCancel}
            onTouchEnd={onScrollViewTouchEnd}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.contentSectionList}>

            <DocumentBreadcrumb document={document} scale={animatedScale} />

            {HtmlView}

            <Footer opacity={animatedOpacity} />
          </ScrollView>
        }

        <LoadingOverlay text={null}
                        isVisible={
                          route.params.id !== undefined
                          && (document === undefined || document.id !== route.params.id)}
                        animate={Settings.songFadeIn} />
      </View>
    </PinchGestureHandler>
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
  }
});

const createHtmlStyles = ({}: ThemeContextProps) => StyleSheet.create({});
