import React, { useEffect, useState } from "react";
import Settings from "../../../../../settings";
import { isIOS } from "../../../../../logic/utils";
import { AbcMelody } from "../../../../../logic/db/models/AbcMelodies";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/ThemeProvider";
import SwitchComponent from "./SwitchComponent";
import ConfirmationModal from "../../../../components/popups/ConfirmationModal";
import PickerComponent from "../../../../components/popups/PickerComponent";
import SliderComponent from "../../../../components/SliderComponent";

interface Props {
  isMelodyShown: boolean;
  enableMelody?: (value: boolean) => void;
  onClose?: () => void;
  selectedMelody?: AbcMelody;
  onMelodySelect?: (value: AbcMelody) => void;
  melodies?: AbcMelody[];
  showMelodyForAllVerses: boolean;
  setShowMelodyForAllVerses?: (value: boolean) => void;
  melodyScale: Animated.Value;
}

const MelodySettingsModal: React.FC<Props> = ({
                                                onClose,
                                                enableMelody,
                                                isMelodyShown,
                                                selectedMelody,
                                                onMelodySelect,
                                                melodies = [],
                                                showMelodyForAllVerses,
                                                setShowMelodyForAllVerses,
                                                melodyScale,
                                              }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [songMelodyScale, setSongMelodyScale] = useState(Settings.songMelodyScale);
  const styles = createStyles(useTheme());

  useEffect(() => {
    Settings.songMelodyScale = songMelodyScale;
  }, [songMelodyScale]);

  const openPicker = () => {
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  const setMelody = (melody: AbcMelody) => {
    closePicker();
    onMelodySelect?.(melody);
  };

  const onScaleSliderValueChange = (value: number) => {
    setSongMelodyScale(value / 100);
    melodyScale.setValue(value / 100);
  }

  return <>
    {!showPicker || selectedMelody === undefined || melodies?.length === 0 ? undefined :
      <PickerComponent selectedValue={selectedMelody}
                       values={melodies}
                       keyExtractor={item => item.name}
                       onDenied={closePicker}
                       onCompleted={it => setMelody(it)}
                       rowContentRenderer={(item, isSelected) =>
                         <Text style={[styles.pickerRowText, (isSelected ? styles.pickerRowTextSelected : {})]}>
                           {item.name}
                         </Text>
                       } />
    }
    <ConfirmationModal isOpen={isIOS ? !showPicker : true}
                       title={"Melody"}
                       closeText={"Close"}
                       invertConfirmColor={false}
                       onClose={onClose}
                       showCloseButton={true}>

      <View style={styles.popupContent}>
        <SwitchComponent title={"Show melody"}
                         isVisible={true}
                         value={isMelodyShown}
                         onPress={() => enableMelody?.(!isMelodyShown)} />
        <SwitchComponent title={"Show melody for all verses"}
                         isVisible={true}
                         value={showMelodyForAllVerses}
                         onPress={() => {
                           Settings.showMelodyForAllVerses = !showMelodyForAllVerses;
                           setShowMelodyForAllVerses?.(!showMelodyForAllVerses);
                         }} />

        {selectedMelody === undefined ? undefined : <View style={styles.melodyContainer}>
          <Text style={styles.label}>Melody</Text>

          <TouchableOpacity style={styles.button}
                            disabled={melodies?.length < 2}
                            onPress={openPicker}>
            <Text style={styles.selectedLanguage}>
              {selectedMelody.name}
            </Text>
            {melodies?.length < 2 ? undefined : <Icon name={"caret-down"} style={styles.arrow} />}
          </TouchableOpacity>
        </View>
        }

        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>Melody size</Text>

          <SliderComponent value={Math.round(songMelodyScale * 100)}
                           onValueChange={isIOS && !showMelodyForAllVerses ? onScaleSliderValueChange : undefined} // iOS is more performant
                           onValueChanged={onScaleSliderValueChange}
                           onReset={() => {
                             setSongMelodyScale(1.0);
                             melodyScale.setValue(1.0);
                           }} />
        </View>
      </View>
    </ConfirmationModal>
  </>;
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {
    alignSelf: "stretch",
    minWidth: "90%",
    marginRight: -10,
    marginBottom: -30
  },
  contentText: {
    paddingTop: 10,
    color: colors.text
  },

  melodyContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  label: {
    color: colors.text,
    fontSize: 15,
    marginRight: 10
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    right: -5,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flex: 1
  },

  selectedLanguage: {
    color: colors.text,
    fontSize: 15,
    textAlign: "right"
  },
  arrow: {
    fontSize: 16,
    marginLeft: 7,
    color: colors.text
  },

  pickerRowText: {
    color: colors.text,
    fontSize: 15
  },
  pickerRowTextSelected: {
    fontWeight: "bold"
  },

  scaleContainer: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 10
  },
  scaleLabel: {
    color: colors.text,
    fontSize: 15,
    paddingBottom: 5
  }
});

export default MelodySettingsModal;
