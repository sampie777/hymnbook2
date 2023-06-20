import React from "react";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { languageAbbreviationToFullName } from "../../../logic/utils";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DownloadIcon, IsDownloadedIcon, UpdateIcon } from "./common";

interface SongBundleItemComponentProps {
  bundle: ServerSongBundle;
  onPress: (bundle: ServerSongBundle) => void;
  disabled: boolean;
}

export const SongBundleItem: React.FC<SongBundleItemComponentProps>
  = ({
       bundle,
       onPress,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}>
        {bundle.name}
      </Text>
      <View style={styles.infoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.infoText}>
            {languageAbbreviationToFullName(bundle.language)}
          </Text>
        }
        {bundle.size === undefined ? undefined :
          <Text style={styles.infoText}>
            {bundle.size} songs
          </Text>
        }
      </View>
      <DownloadIcon />
    </TouchableOpacity>
  );
};

interface LocalSongBundleItemComponentProps {
  bundle: LocalSongBundle;
  onPress: (bundle: LocalSongBundle) => void;
  hasUpdate?: boolean;
  disabled: boolean;
}

export const LocalSongBundleItem: React.FC<LocalSongBundleItemComponentProps>
  = ({
       bundle,
       onPress,
       hasUpdate = false,
       disabled
     }) => {
  const styles = createStyles(useTheme());
  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      style={styles.container}
                      disabled={disabled}>
      <Text style={styles.titleText}>
        {bundle.name}
      </Text>
      <View style={styles.infoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.infoText}>
            {languageAbbreviationToFullName(bundle.language)}
          </Text>
        }
        <Text style={styles.infoText}>
          {bundle.songs.length} songs
        </Text>
      </View>
      <View>
        {!hasUpdate ? <IsDownloadedIcon /> : <UpdateIcon />}
      </View>
    </TouchableOpacity>
  );
};


const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    paddingRight: 20,
    paddingVertical: 14,
    borderColor: colors.border.default,
    borderBottomWidth: 1,
    backgroundColor: colors.surface1,
    flexDirection: "row",
    alignItems: "center"
  },
  titleText: {
    paddingLeft: 20,
    fontSize: 17,
    flex: 1,
    color: colors.text.default
  },
  infoContainer: {
    paddingRight: 20,
    paddingLeft: 5,
    alignItems: "flex-end"
  },
  infoText: {
    fontSize: 13,
    color: colors.text.lighter
  }
});
