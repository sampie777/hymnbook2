import React, { PropsWithChildren, useRef } from "react";
import { Animated, Pressable, TouchableOpacityProps } from "react-native";
import { isAndroid } from "../../logic/utils";

interface Props extends PropsWithChildren<TouchableOpacityProps> {
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

  // Another check to make sure the component will reset to default state if no cancel event is fired
  let timeout: NodeJS.Timeout | null = null;
  const startMaxTimeout = () => {
    try {
      if (timeout != null) clearTimeout(timeout);
    } catch (e) {
    }

    timeout = setTimeout(() => opacity.current.setValue(1), 1500);
  }

  return <AnimatedPressable onPressIn={() => {
    opacity.current.setValue(props.activeOpacity ?? 0.5);
    startMaxTimeout();
  }}
                            onPressOut={() => opacity.current.setValue(1)}
                            {...props}
                            style={[props.style, { opacity: opacity.current }]}
                            needsOffscreenAlphaCompositing={!isAndroid}
                            renderToHardwareTextureAndroid={isAndroid}>
    {props.children}
  </AnimatedPressable>;
};
export default OffscreenTouchableOpacity;
