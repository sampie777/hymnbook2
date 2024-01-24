import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import Db from "../../../../../logic/db/db";
import { rollbar } from "../../../../../logic/rollbar";
import { runAsync, sanitizeErrorForRollbar } from "../../../../../logic/utils";
import Icon from "react-native-vector-icons/FontAwesome5";
import SongBundlePicker from "../../../../components/popups/SongBundlePicker";
import Settings from "../../../../../settings";
import { CollectionChangeCallback } from "realm";
import { useFocusEffect } from "@react-navigation/native";
import { useIsMounted } from "../../../../components/utils";
import { SongBundle } from "../../../../../logic/db/models/Songs";
import { SongBundleSchema } from "../../../../../logic/db/models/SongsSchema";

interface Props {
  selectedBundleUuids: string[];
  onChange: (value: string[]) => void;
}

const SongBundleSelect: React.FC<Props> = ({ selectedBundleUuids, onChange }) => {
  const isMounted = useIsMounted({ trackFocus: true });
  const [isOpen, setIsOpen] = useState(false);
  const [bundles, setBundles] = useState<SongBundle[]>([]);
  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
  };

  const onExit = () => {
    setBundles([]);
  };

  useFocusEffect(useCallback(() => {
    onFocus();
    return onBlur;
  }, []));

  const onFocus = () => {
    Db.songs.realm().objects<SongBundle>(SongBundleSchema.name).addListener(onCollectionChange);
  };

  const onBlur = () => {
    Db.songs.realm().objects<SongBundle>(SongBundleSchema.name).removeListener(onCollectionChange);
  };

  const onCollectionChange: CollectionChangeCallback<SongBundle> = () => {
    // This is needed, as the removeListener doesn't seem to correctly work.
    if (!isMounted) {
      return;
    }
    runAsync(reloadBundles);

    // This settings will also be updated, but the home page doesn't refresh,
    // so we need to manually send the update
    onChange(Settings.songSearchSelectedBundlesUuids);
  };

  const reloadBundles = () => {
    try {
      const result = Db.songs.realm().objects<SongBundle>(SongBundleSchema.name);
      setBundles(Array.from(result));
    } catch (error) {
      rollbar.error("Failed to load song bundles from database for search screen.", sanitizeErrorForRollbar(error));
    }
  };

  const _onChange = (selectedBundles: SongBundle[]) => {
    setIsOpen(false);

    const uuids = selectedBundles.map(it => it.uuid);
    onChange(uuids);
    Settings.songSearchSelectedBundlesUuids = uuids;
    Settings.store();
  };

  const selectedBundles = bundles.filter(it => selectedBundleUuids.includes(it.uuid));

  if (bundles.length <= 1) {
    return null;
  }

  return <View style={styles.container}>
    {!isOpen ? null : <SongBundlePicker bundles={bundles}
                                        selectedBundles={selectedBundles}
                                        onConfirm={_onChange}
                                        onDenied={() => setIsOpen(false)} />}

    <TouchableOpacity style={styles.button}
                      onPress={() => setIsOpen(true)}>
      <Icon name={"filter"} style={styles.icon} />
      <Icon name={isOpen ? "sort-up" : "sort-down"} style={styles.icon} />
    </TouchableOpacity>
  </View>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    bottom: 20,
    height: 50,
    width: 50,
    flex: 1,
    alignSelf: "flex-start",
    justifyContent: "flex-end"
  },
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
  },

  icon: {
    fontSize: 18,
    textAlign: "center",
    color: colors.text.lighter
  }
});

export default SongBundleSelect;
