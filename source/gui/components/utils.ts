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
export const debounce = (callback: (...args: any) => void, period: number): (...args: any) => void => {
  const timeout = useRef<NodeJS.Timeout | undefined>();

  return (...args: any) => {
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
          callback(...args);
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
  const delimiter = "░";
  return text.replace(new RegExp(`(${searchText})`, "g" + (caseInsensitive ? "i" : "")), delimiter + "$1" + delimiter)
    .split(delimiter)
    .map((it, index) => {
      if (RegExp(searchText, caseInsensitive ? "i" : "").test(it)) {
        return renderReplacement(it, index);
      }
      return it;
    });
};

export const mergeStyleSheets = (styles: Array<object | Array<object>>): object => {
  const result: { [key: string]: Array<object> } = {};

  styles.flatMap(style => Array.isArray(style) ? [...style] : style)
    .forEach((style: { [key: string]: any }) => {
      Object.keys(style).forEach(key => {
        if (result[key] == undefined)
          result[key] = [];

        result[key].push(style[key]);
      });
    });
  return result;
};
