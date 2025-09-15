import React, {Dispatch, SetStateAction} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SongSearch } from "../../../../logic/songs/songSearch";
import StringSearchButton from "./StringSearchButton";
import SongNumberInput from "./SongNumberInput";
import SongBundleSelect from "./filters/SongBundleSelect";
import { ThemeContextProps, useTheme } from "../../../components/providers/ThemeProvider";
import { Song } from "../../../../logic/db/models/songs/Songs";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import { ParamList } from "../../../../navigation";

type Props = {
  value: string
  previousValue: string
  results: Song[]
  onPress: () => void
  useSmallerFontSize: boolean
  navigation: BottomTabNavigationProp<ParamList>
  stringSearchButtonPlacement: SongSearch.StringSearchButtonPlacement
  selectedBundleUuids: string[]
  setSelectedBundleUuids: (value: string[]) => void
  setInputValue: Dispatch<SetStateAction<string>>
};

const SearchHeading: React.FC<Props> = ({
                                          value,
                                          previousValue,
                                          useSmallerFontSize,
                                          stringSearchButtonPlacement,
                                          results,
                                          navigation,
                                          onPress,
                                          selectedBundleUuids,
                                          setSelectedBundleUuids,
                                          setInputValue,
                                        }) => {
  const styles = createStyles(useTheme());

  const isStringSearchButtonsPosition = (position: SongSearch.StringSearchButtonPlacement) => {
    if (stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.BottomLeft
      || stringSearchButtonPlacement == SongSearch.StringSearchButtonPlacement.BottomRight) {
      return position == SongSearch.StringSearchButtonPlacement.BottomLeft
        || position == SongSearch.StringSearchButtonPlacement.BottomRight;
    }
    return position == stringSearchButtonPlacement;
  };

  return <View style={styles.container}>
    <View style={styles.containerSides}>
      {!isStringSearchButtonsPosition(SongSearch.StringSearchButtonPlacement.TopLeft)
      || value.length > 0 || results.length > 0 ? undefined :
        <StringSearchButton navigation={navigation}
                            position={stringSearchButtonPlacement} />
      }
    </View>

    <View style={styles.containerCenter}>
      <Text style={[styles.infoText, (!useSmallerFontSize ? {} : styles.infoTextSmaller)]}>Enter song
        number:</Text>

      <SongNumberInput onPress={onPress}
                       value={value}
                       useSmallerFontSize={useSmallerFontSize}
                       previousValue={previousValue}
                       setInputValue={setInputValue} />
    </View>

    <View style={styles.containerSides}>
      <SongBundleSelect selectedBundleUuids={selectedBundleUuids} onChange={setSelectedBundleUuids} />
    </View>
  </View>
};

export default SearchHeading;

const createStyles = ({ colors, fontFamily }: ThemeContextProps) => StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 5
  },
  containerSides: {
    width: 75,  // Width calculated based on StringSearchButton
    alignItems: "center",
    justifyContent: "flex-start"
  },
  containerCenter: {
    flex: 1,
    alignItems: "center"
  },

  infoText: {
    fontSize: 18,
    color: colors.text.default,
    paddingTop: 20,
    fontFamily: fontFamily.sansSerifLight,
    textAlign: "center"
  },
  infoTextSmaller: {
    fontSize: 14
  },
});
