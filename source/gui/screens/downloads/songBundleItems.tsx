import React from "react";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/songs/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { languageAbbreviationToFullName } from "../../../logic/utils/utils.ts";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DownloadIcon, IsDownloadedIcon, IsDownloadingIcon, UpdateIcon } from "./common";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import { Licenses } from "../../../logic/organizations/licenses.ts";
import { License } from "../../../logic/organizations/models.ts";

interface SongBundleItemComponentProps {
  bundle: ServerSongBundle;
  onPress: (bundle: ServerSongBundle) => void;
  onLongPress?: (bundle: ServerSongBundle) => void;
  disabled: boolean;
  licenses?: License[];
}

export const SongBundleItem: React.FC<SongBundleItemComponentProps>
  = ({
       bundle,
       onPress,
       onLongPress,
       disabled,
       licenses = [],
     }) => {
  const styles = createStyles(useTheme());
  const { songBundlesUpdating } = useUpdaterContext();
  const isUpdating = songBundlesUpdating.some(it => it.uuid === bundle.uuid);
  const hasLicense = Licenses.isSongBundleAllowed(bundle, licenses);

  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      onLongPress={() => onLongPress?.(bundle)}
                      style={styles.container}
                      disabled={disabled || isUpdating}>
      <Text style={styles.titleText}
            importantForAccessibility={"auto"}>
        {bundle.name}
      </Text>
      <View style={styles.infoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.infoText}
                importantForAccessibility={"auto"}>
            {languageAbbreviationToFullName(bundle.language)}
          </Text>
        }
        {hasLicense ? undefined :
          <Text style={[styles.infoText, styles.licenseText]} importantForAccessibility={'no'}>
            License required
          </Text>
        }
        {!hasLicense || bundle.size === undefined ? undefined :
          <Text style={styles.infoText} importantForAccessibility={'no'}>
            {bundle.size} songs
          </Text>
        }
      </View>
      <View>
        {isUpdating ? <IsDownloadingIcon /> : <DownloadIcon />}
      </View>
    </TouchableOpacity>
  );
};

interface LocalSongBundleItemComponentProps {
  bundle: LocalSongBundle;
  onPress: (bundle: LocalSongBundle) => void;
  onLongPress?: (bundle: LocalSongBundle) => void;
  hasUpdate?: boolean;
  disabled: boolean;
  licenses?: License[];
}

export const LocalSongBundleItem: React.FC<LocalSongBundleItemComponentProps>
  = ({
       bundle,
       onPress,
       onLongPress,
       hasUpdate = false,
       disabled,
       licenses = [],
     }) => {
  const styles = createStyles(useTheme());
  const { songBundlesUpdating } = useUpdaterContext();
  const isUpdating = songBundlesUpdating.some(it => it.uuid === bundle.uuid);
  const hasLicense = Licenses.isSongBundleAllowed(bundle, licenses);

  return (
    <TouchableOpacity onPress={() => onPress(bundle)}
                      onLongPress={() => onLongPress?.(bundle)}
                      style={styles.container}
                      disabled={disabled || isUpdating}>
      <Text style={styles.titleText}
            importantForAccessibility={"auto"}>
        {bundle.name}
      </Text>
      <View style={styles.infoContainer}>
        {bundle.language === undefined || bundle.language === "" ? undefined :
          <Text style={styles.infoText}
                importantForAccessibility={"auto"}>
            {languageAbbreviationToFullName(bundle.language)}
          </Text>
        }

        {!hasLicense
          ? <Text style={[styles.infoText, styles.licenseText]} importantForAccessibility={'no'}>
            License required
          </Text>
          : <Text style={styles.infoText} importantForAccessibility={'no'}>
            {bundle.songs.length} songs
          </Text>
        }
      </View>
      <View>
        {isUpdating ? <IsDownloadingIcon /> :
          (!hasUpdate ? <IsDownloadedIcon /> : <UpdateIcon />)}
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
  },
  licenseText: {
    color: colors.text.warning,
  },
});
