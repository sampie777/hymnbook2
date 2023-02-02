import { Animated } from "react-native";
import Svg, { G } from "react-native-svg";
import { useRef } from "react";
import { rollbar } from "../../logic/rollbar";

export const AnimatedSvg = Animated.createAnimatedComponent(Svg);
export const AnimatedG = Animated.createAnimatedComponent(G);

/**
 * Function which calls a callback after a set amount of time (period).
 * If the return function is called multiple times, it will cancel the timeout
 * for each preceding time, so the callback is only executed after the
 * last timeout.
 * @param callback
 * @param period
 * @return use the return function to be called on for debounce to work
 */
export const debounce = (callback: () => void, period: number): () => void => {
  const timeout = useRef<NodeJS.Timeout | undefined>();

  return () => {
    if (timeout.current != undefined) {
      try {
        clearTimeout(timeout.current);
      } catch (e: any) {
        rollbar.warning("[debounce] Failed to clear timeout", {
          error: e,
          period: period
        });
      }
    }

    try {
      timeout.current = setTimeout(() => {
        timeout.current = undefined;

        try {
          callback();
        } catch (e: any) {
          rollbar.error("[debounce] Failed to execute callback", {
            error: e,
            period: period
          });
        }
      }, period);
    } catch (e: any) {
      rollbar.error("[debounce] Failed to set timeout", {
        error: e,
        period: period
      });
    }
  };
};
