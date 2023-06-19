import React, { useRef } from "react";
import { Animated, Pressable, TouchableOpacityProps } from "react-native";
import { isAndroid } from "../../logic/utils";

interface Props extends TouchableOpacityProps {
  children: React.ReactNode;
}

/**
 * This component uses needsOffscreenAlphaCompositing/renderToHardwareTextureAndroid.
 * Only use this component if shadows of child components don't render correctly on an active press.
 * @param props
 * @constructor
 */
const OffscreenTouchableOpacity: React.FC<Props> = (props) => {
  const opacity = useRef(new Animated.Value(1));
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
  return <AnimatedPressable onPressIn={() => opacity.current.setValue(props.activeOpacity ?? 0.5)}
                            onPressOut={() => opacity.current.setValue(1)}
                            {...props}
                            style={[props.style, { opacity: opacity.current }]}
                            needsOffscreenAlphaCompositing={!isAndroid}
                            renderToHardwareTextureAndroid={isAndroid}>
    {props.children}
  </AnimatedPressable>;
};
export default OffscreenTouchableOpacity;
