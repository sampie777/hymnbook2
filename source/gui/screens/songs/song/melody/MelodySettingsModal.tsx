import React, { useEffect, useState } from "react";
import Settings from "../../../../../settings";
import { isIOS } from "../../../../../logic/utils";
import { AbcMelody } from "../../../../../logic/db/models/AbcMelodies";
import TrackPlayer from "react-native-track-player";
import Icon from "react-native-vector-icons/FontAwesome5";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemeContextProps, useTheme } from "../../../../components/providers/ThemeProvider";
import SwitchComponent from "./SwitchComponent";
import ConfirmationModal from "../../../../components/popups/ConfirmationModal";
import PickerComponent from "../../../../components/popups/PickerComponent";
import SliderComponent from "../../../../components/SliderComponent";
import MelodySettingsModelHeader from "./MelodySettingsModelHeader";

interface Props {
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
                                                selectedMelody,
                                                onMelodySelect,
                                                melodies = [],
                                                showMelodyForAllVerses,
                                                setShowMelodyForAllVerses,
                                                melodyScale
                                              }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [songMelodyScale, setSongMelodyScale] = useState(Settings.songMelodyScale);
  const [songAudioPlaybackSpeed, setSongAudioPlaybackSpeed] = useState(Settings.songAudioPlaybackSpeed);
  const styles = createStyles(useTheme());

  useEffect(() => {
    Settings.songMelodyScale = songMelodyScale;
  }, [songMelodyScale]);

  useEffect(() => {
    Settings.songAudioPlaybackSpeed = songAudioPlaybackSpeed;
    TrackPlayer.setRate(songAudioPlaybackSpeed);
  }, [songAudioPlaybackSpeed]);

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
  };

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
                       title={"Configuration"}
                       closeText={"Close"}
                       invertConfirmColor={false}
                       onClose={() => {
                         Settings.store();
                         onClose?.();
                       }}
                       showCloseButton={true}>

      <View style={styles.popupContent}>
        <MelodySettingsModelHeader title={"Musical notation"}
                                   iconName={"music"}
                                   hideBorder={true} />

        <SwitchComponent title={"Show melody for all verses"}
                         isVisible={true}
                         value={showMelodyForAllVerses}
                         onPress={() => {
                           Settings.showMelodyForAllVerses = !showMelodyForAllVerses;
                           setShowMelodyForAllVerses?.(!showMelodyForAllVerses);
                         }} />

        <View style={styles.melodyContainer}>
          <Text style={styles.label}>Melody</Text>

          <TouchableOpacity style={styles.button}
                            disabled={melodies?.length < 2}
                            onPress={openPicker}>
            <Text style={styles.selectedLanguage}>
              {melodies.length === 0 ? "No melodies available"
                : (selectedMelody?.name ?? "No default set")}
            </Text>
            {melodies?.length < 2 ? undefined : <Icon name={"caret-down"} style={styles.arrow} />}
          </TouchableOpacity>
        </View>

        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>Melody size:</Text>

          <SliderComponent value={Math.round(songMelodyScale * 100)}
                           onValueChange={isIOS && !showMelodyForAllVerses ? onScaleSliderValueChange : undefined} // iOS is more performant
                           onValueChanged={onScaleSliderValueChange}
                           onReset={() => {
                             setSongMelodyScale(1.0);
                             melodyScale.setValue(1.0);
                           }} />
        </View>

        <MelodySettingsModelHeader title={"Audio"} iconName={"volume-up"} />

        <View style={styles.scaleContainer}>
          <Text style={styles.scaleLabel}>Audio playback speed:</Text>

          <SliderComponent value={songAudioPlaybackSpeed}
                           suffix={"x"}
                           minValue={0.5}
                           maxValue={2.0}
                           step={0.25}
                           onValueChanged={setSongAudioPlaybackSpeed}
                           onReset={() => {
                             setSongAudioPlaybackSpeed(1.0);
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
    color: colors.text.default
  },

  melodyContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  label: {
    color: colors.text.default,
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
    color: colors.text.default,
    fontSize: 15,
    textAlign: "right"
  },
  arrow: {
    fontSize: 16,
    marginLeft: 7,
    color: colors.text.default
  },

  pickerRowText: {
    color: colors.text.default,
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
    color: colors.text.default,
    fontSize: 15,
    paddingBottom: 5
  }
});

export default MelodySettingsModal;
