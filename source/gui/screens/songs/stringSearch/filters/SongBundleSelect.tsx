import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import { SongBundle } from "../../../../../logic/db/models/songs/Songs";
import Db from "../../../../../logic/db/db";
import { rollbar } from "../../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../../logic/utils";
import { SongBundleSchema } from "../../../../../logic/db/models/songs/SongsSchema";
import SongBundlePicker from "../../../../components/popups/SongBundlePicker";
import Settings from "../../../../../settings";

interface Props {
  selectedBundleUuids: string[];
  onChange: (value: string[]) => void;
}

const SongBundleSelect: React.FC<Props> = ({ selectedBundleUuids, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bundles, setBundles] = useState<SongBundle[]>([]);
  const styles = createStyles(useTheme());

  useEffect(() => {
    reloadBundles();
  }, []);

  const reloadBundles = () => {
    try {
      const result = Db.songs.realm().objects<SongBundle>(SongBundleSchema.name);
      setBundles(result.map(it => SongBundle.clone(it)));
    } catch (error) {
      rollbar.error("Failed to load song bundles from database for string search screen.", sanitizeErrorForRollbar(error));
    }
  };

  const _onChange = (selectedBundles: SongBundle[]) => {
    setIsOpen(false);

    const uuids = selectedBundles.map(it => it.uuid);
    onChange(uuids);
    Settings.songStringSearchSelectedBundlesUuids = uuids;
    Settings.store();
  };

  const selectedBundles = bundles.filter(it => selectedBundleUuids.includes(it.uuid));

  const selectedBundlesText = () => {
    if (selectedBundles.length == bundles.length || selectedBundles.length == 0) return "All";
    return selectedBundles
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(it => it.name).join(", ");
  };

  return <View style={styles.container}>
    {!isOpen ? null : <SongBundlePicker bundles={bundles}
                                        selectedBundles={selectedBundles}
                                        onConfirm={_onChange}
                                        onDenied={() => setIsOpen(false)}
                                        title={"Search only in the selected bundles"} />}

    <TouchableOpacity style={styles.button}
                      onPress={() => setIsOpen(true)}>
      <Text style={styles.text}
            numberOfLines={2}
            importantForAccessibility={"auto"}>
        Song bundles:
      </Text>
      <Text style={[styles.text, styles.value]}
            numberOfLines={2}
            importantForAccessibility={"auto"}>
        {selectedBundlesText()}
      </Text>

    </TouchableOpacity>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {},
  button: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 5
  },
  text: {
    color: colors.text.default,
    fontSize: 16
  },
  value: {
    flex: 1,
    fontWeight: "bold"
  }
});

export default SongBundleSelect;
