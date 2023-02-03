import React, { useRef } from "react";
import { rollbar } from "../../logic/rollbar";
import { Animated } from "react-native";
import Svg, { G } from "react-native-svg";

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


/**
 * Render certain text differently based on searchText. Returns a
 * React node group where `searchText` are replaced by a custom render function
 * @param text Body of text which has to be transformed
 * @param searchText The text which has to be rendered differently
 * @param renderReplacement The render function which generates the replacement React node
 * @param caseInsensitive The searchText must be treated caseInsensitive
 */
export const renderTextWithCustomReplacements = (text: string,
                                                 searchText: string,
                                                 renderReplacement: ((text: string, index: number) => React.ReactNode | null | undefined),
                                                 caseInsensitive: boolean = true): Array<React.ReactNode | string> => {
  const normalizedSearchText = caseInsensitive ? searchText.toLowerCase() : searchText;

  const delimiter = "░";
  return text.replace(new RegExp(`(${normalizedSearchText})`, "g" + (caseInsensitive ? "i" : "")), delimiter + "$1" + delimiter)
    .split(delimiter)
    .map((it, index) => {
      if ((caseInsensitive ? it.toLowerCase() : it) == normalizedSearchText) {
        return renderReplacement(it, index);
      }
      return it;
    });
};
