import React, { useEffect, useRef, useState } from "react";
import Db from "../../../logic/db/db";
import { NativeStackNavigationProp } from "react-native-screens/src/native-stack/types";
import { DocumentSchema } from "../../../logic/db/models/DocumentsSchema";
import { ParamList, routes } from "../../../navigation";
import { Document } from "../../../logic/db/models/Documents";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { Easing } from "react-native-reanimated";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  navigation: NativeStackNavigationProp<ParamList>;
  document?: Document;
  scrollOffset?: number;
}

const DocumentControls: React.FC<Props> =
  ({
     navigation,
     document,
     scrollOffset
   }) => {
    // Persist this value between renders due to receiving new props (scrollOffset)
    const animatedVerticalOffset = useRef(new Animated.Value<number>(0));
    const [previousScrollOffset, setPreviousScrollOffset] = useState(0);
    const [scrollDirection, setScrollDirection] = useState(0);

    const styles = createStyles(useTheme());
    const animatedStyle = {
      buttonBase: {
        transform: [
          { translateY: animatedVerticalOffset.current }
        ]
      }
    };

    useEffect(() => {
      if (scrollOffset === undefined) {
        return;
      }

      if (scrollOffset === previousScrollOffset) {
        return;
      }

      const newScrollDirection = scrollOffset > previousScrollOffset ? -1 : 1;
      if (newScrollDirection > 0 && previousScrollOffset - scrollOffset < 10) {
        // Don't show buttons when screen was just scrolled a little bit up
        setPreviousScrollOffset(scrollOffset);
        return;
      }

      const newAnimatedVerticalOffset = newScrollDirection > 0 ? 0 : 100;
      setPreviousScrollOffset(scrollOffset);

      if (scrollDirection !== 0) {
        // Wait for previous animation to finish
        return;
      }
      setScrollDirection(newScrollDirection);

      Animated.timing(animatedVerticalOffset.current, {
        toValue: newAnimatedVerticalOffset,
        duration: 300,
        easing: Easing.inOut(Easing.ease)
      })
        .start(() => setScrollDirection(0));
    }, [scrollOffset]);

    const getPreviousDocument = () => {
      if (document === undefined || document.index <= 0) {
        return undefined;
      }

      const documents = Db.documents.realm().objects<Document>(DocumentSchema.name)
        .filtered(`index < ${document.index} AND _parent.id = ${Document.getParent(document)?.id || 0}`)
        .sorted("index", true);

      if (documents === undefined || documents === null || documents.length === 0) {
        return undefined;
      }

      return documents[0];
    };

    const getNextDocument = () => {
      if (document === undefined || document.index < 0) {
        return undefined;
      }

      const documents = Db.documents.realm().objects<Document>(DocumentSchema.name)
        .filtered(`index > ${document.index} AND _parent.id = ${Document.getParent(document)?.id || 0}`)
        .sorted("index");

      if (documents === undefined || documents === null || documents.length === 0) {
        return undefined;
      }

      return documents[0];
    };

    const previousDocument = getPreviousDocument();
    const nextDocument = getNextDocument();

    const goToDocument = (doc: Document) => {
      navigation.navigate(routes.Document, {
        id: doc.id
      });
    };

    const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

    return <View style={styles.container} pointerEvents={'box-none'} >
      {previousDocument === undefined ? undefined :
        <AnimatedTouchableOpacity style={[styles.buttonBase, styles.button, animatedStyle.buttonBase]}
                                  onPress={() => goToDocument(previousDocument)}>
          <Icon name={"chevron-left"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </AnimatedTouchableOpacity>
      }

      <View style={styles.horizontalGap} />

      {nextDocument === undefined ?
        (document === undefined ? undefined :
            <View style={styles.buttonBase} />
        ) :
        <AnimatedTouchableOpacity style={[styles.buttonBase, styles.button, animatedStyle.buttonBase]}
                                  onPress={() => goToDocument(nextDocument)}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </AnimatedTouchableOpacity>
      }
    </View>;
  };

export default DocumentControls;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    paddingHorizontal: 3,
    bottom: 30,
    zIndex: 1
  },

  buttonBase: {
    width: 45,
    height: 45,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: colors.primaryVariant,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",

    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonDisabled: {
    backgroundColor: colors.buttonVariant,
    elevation: 2
  },
  buttonInvert: {
    backgroundColor: colors.button
  },

  buttonText: {
    color: colors.onPrimary,
    fontSize: 18
  },
  buttonTextDisabled: {
    opacity: 0.3,
    color: colors.textLighter
  },
  buttonInvertText: {
    color: colors.textLighter
  },

  horizontalGap: {
    flex: 1
  }
});
