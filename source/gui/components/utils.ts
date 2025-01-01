import React, { useCallback, useEffect, useRef, useState } from "react";
import { rollbar } from "../../logic/rollbar";
import { Animated, Insets } from "react-native";
import Svg, { G } from "react-native-svg";
import { runAsync, sanitizeErrorForRollbar } from "../../logic/utils";
import { useFocusEffect } from "@react-navigation/native";
import { SongBundle } from "../../logic/db/models/Songs";
import Db from "../../logic/db/db";
import { SongBundleSchema } from "../../logic/db/models/SongsSchema";

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
      } catch (error) {
        rollbar.warning("[debounce] Failed to clear timeout", {
          ...sanitizeErrorForRollbar(error),
          period: period
        });
      }
    }

    try {
      timeout.current = setTimeout(() => {
        timeout.current = undefined;

        try {
          callback(...args);
        } catch (error) {
          rollbar.error("[debounce] Failed to execute callback", {
            ...sanitizeErrorForRollbar(error),
            period: period
          });
        }
      }, period);
    } catch (error) {
      rollbar.error("[debounce] Failed to set timeout", {
        ...sanitizeErrorForRollbar(error),
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

export const RectangularInset = (size: number): Insets => ({ top: size, right: size, bottom: size, left: size });

export const useIsMounted = (options: { trackFocus: boolean } = { trackFocus: false }): () => boolean => {
  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (options.trackFocus) {
    useFocusEffect(useCallback(() => {
      isMounted.current = true;
      return () => {
        isMounted.current = false;
      };
    }, []));
  }

  return () => isMounted.current;
};


export const useCollectionListener = <T>(objects: Realm.Results<Realm.Object<T> & T>, onChange: () => void) => {
  const isMounted = useIsMounted({ trackFocus: true });

  useFocusEffect(useCallback(() => {
    try {
      objects.addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to handle collection change", sanitizeErrorForRollbar(error));
    }
    return () => {
      objects.removeListener(onCollectionChange);
    };
  }, []));

  const onCollectionChange = () => {
    runAsync(() => {
      // This is needed, as the removeListener doesn't seem to correctly work.
      if (!isMounted()) return;

      onChange();
    });
  };
};

/**
 * Returns a function that listens to the song bundle length in the database.
 * Returns -1 if not loaded  yet.
 */
export const useSongBundleCount = (): () => number => {
  const [bundlesCount, setBundlesCount] = useState<number>(-1);

  useCollectionListener<SongBundle>(Db.songs.realm().objects(SongBundleSchema.name), () => {
    try {
      const result = Db.songs.realm().objects<SongBundle>(SongBundleSchema.name);
      setBundlesCount(result.length);
    } catch (error) {
      rollbar.error("Failed to load song bundles from database.", sanitizeErrorForRollbar(error));
    }
  });

  return () => bundlesCount;
}