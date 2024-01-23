import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import { SongBundle } from "../../../../../logic/db/models/Songs";
import Db from "../../../../../logic/db/db";
import { rollbar } from "../../../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../../../logic/utils";
import { SongBundleSchema } from "../../../../../logic/db/models/SongsSchema";
import MultiPickerComponent from "../../../../components/popups/MultiPickerComponent";

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
}

const SongBundleSelect: React.FC<Props> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [bundles, setBundles] = useState<SongBundle[]>([]);
  const styles = createStyles(useTheme());

  useEffect(() => {
    reloadBundles();
  }, []);

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
    onChange(selectedBundles.map(it => it.uuid));
  };

  const selectedBundles = bundles.filter(it => value.includes(it.uuid));

  const selectedBundlesText = () => {
    if (selectedBundles.length == bundles.length || selectedBundles.length == 0) return "All";
    return selectedBundles.map(it => it.name).join(", ");
  };

  return <View style={styles.container}>
    {!isOpen ? null :
      <MultiPickerComponent selectedValues={selectedBundles.length == 0 ? bundles : selectedBundles}
                            values={bundles}
                            invertConfirmColor={true}
                            keyExtractor={item => item.uuid}
                            onDenied={() => setIsOpen(false)}
                            onCompleted={_onChange}
                            rowContentRenderer={(item, isSelected) =>
                              <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}>
                                {item.name}
                              </Text>} />
    }

    <TouchableOpacity style={styles.button}
                      onPress={() => setIsOpen(true)}>
      <Text style={styles.text} numberOfLines={2}>
        Song bundles:
      </Text>
      <Text style={[styles.text, styles.value]} numberOfLines={2}>
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
  },

  pickerRowText: {
    color: colors.text.default,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold"
  }
});

export default SongBundleSelect;
