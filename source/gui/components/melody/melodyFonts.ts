import { Image, PixelRatio, Platform as RNPlatform } from "react-native";
import { SkFont, Skia, SkTypeface, useFont } from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { AbcConfig } from "./config";

const ANDROID_MUSIC_SCALE = RNPlatform.OS === "android" ? 1.17 : 1;

let cachedMusicTypeface: SkTypeface | null = null;
let cachedRobotoTypeface: SkTypeface | null = null;
let preloadPromise: Promise<boolean> | null = null;

const resolveAssetUri = (source: number | string): string => {
  if (typeof source === "string") return source;
  const asset = Image.resolveAssetSource(source);
  return asset.uri;
};

export const preloadMelodyFonts = async (): Promise<boolean> => {
  if (cachedMusicTypeface && cachedRobotoTypeface) {
    return true;
  }
  if (preloadPromise) {
    return preloadPromise;
  }

  preloadPromise = (async () => {
    try {
      const musicUri = resolveAssetUri(require("../../../../assets/fonts/MusiQwikCustom.ttf"));
      const robotoUri = resolveAssetUri(require("../../../../assets/fonts/Roboto-Regular-Extended.ttf"));

      const [musicData, robotoData] = await Promise.all([
        Skia.Data.fromURI(musicUri),
        Skia.Data.fromURI(robotoUri),
      ]);

      if (!musicData || !robotoData) return false;

      const mTypeface = Skia.Typeface.MakeFreeTypeFaceFromData(musicData);
      const rTypeface = Skia.Typeface.MakeFreeTypeFaceFromData(robotoData);

      if (mTypeface && rTypeface) {
        cachedMusicTypeface = mTypeface;
        cachedRobotoTypeface = rTypeface;
        return true;
      }
      return false;
    } catch {
      return false;
    }
  })();

  return preloadPromise;
};

export interface MelodyFonts {
  musicFont: SkFont | null;
  lyricFont: SkFont | null;
  chordFont: SkFont | null;
}

export const areMelodyFontsLoaded = (): boolean => {
  return cachedMusicTypeface !== null && cachedRobotoTypeface !== null;
};

export const getMelodyFonts = (): MelodyFonts => {
  if (!cachedMusicTypeface || !cachedRobotoTypeface) {
    return { musicFont: null, lyricFont: null, chordFont: null };
  }
  const fontScale = PixelRatio.getFontScale();
  return {
    musicFont: Skia.Font(cachedMusicTypeface, AbcConfig.noteSize * fontScale * ANDROID_MUSIC_SCALE),
    lyricFont: Skia.Font(cachedRobotoTypeface, AbcConfig.textSize * fontScale),
    chordFont: Skia.Font(cachedRobotoTypeface, AbcConfig.chordSize * fontScale),
  };
};

export const useMelodyFonts = (): MelodyFonts => {
  const [fonts, setFonts] = useState<MelodyFonts>(() => getMelodyFonts());

  useEffect(() => {
    if (!areMelodyFontsLoaded()) {
      preloadMelodyFonts().then(() => {
        setFonts(getMelodyFonts());
      });
    }
  }, []);

  const fontScale = PixelRatio.getFontScale();
  const fallbackMusicFont = useFont(require("../../../../assets/fonts/MusiQwikCustom.ttf"), AbcConfig.noteSize * fontScale * ANDROID_MUSIC_SCALE);
  const fallbackLyricFont = useFont(require("../../../../assets/fonts/Roboto-Regular-Extended.ttf"), AbcConfig.textSize * fontScale);
  const fallbackChordFont = useFont(require("../../../../assets/fonts/Roboto-Regular-Extended.ttf"), AbcConfig.chordSize * fontScale);

  if (fonts.musicFont && fonts.lyricFont && fonts.chordFont) {
    return fonts;
  }

  return {
    musicFont: fonts.musicFont || fallbackMusicFont,
    lyricFont: fonts.lyricFont || fallbackLyricFont,
    chordFont: fonts.chordFont || fallbackChordFont,
  };
};
