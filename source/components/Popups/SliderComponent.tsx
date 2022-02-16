import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import MultiSlider, { LabelProps } from "@ptomasroos/react-native-multi-slider";
import ConfirmationModal from "../ConfirmationModal";

const SliderLabel: React.FC<LabelProps> = ({ oneMarkerValue, oneMarkerLeftPosition }) => {
  const styles = createStyles(useTheme());
  return <Text style={[styles.label, { left: oneMarkerLeftPosition - 55 / 2 + 7 }]}>
    {oneMarkerValue} %
  </Text>;
};

interface Props {
  title: string,
  description?: string,
  initialValue: number,
  onCompleted?: (value: number) => void,
  onDenied?: () => void,
}

const SliderComponent: React.FC<Props> = ({
                                            title,
                                            description,
                                            initialValue,
                                            onCompleted,
                                            onDenied
                                          }) => {
  const [screenWidth, setScreenWidth] = useState(0);
  const [sliderValue, setSliderValue] = useState(initialValue);
  const styles = createStyles(useTheme());

  const onConfirm = () => {
    onCompleted?.(sliderValue);
  };

  return <ConfirmationModal isOpen={true}
                            title={title}
                            closeText={"Cancel"}
                            confirmText={"Save"}
                            invertConfirmColor={true}
                            onClose={onDenied}
                            onConfirm={onConfirm}>
    <View style={styles.popupContent}
          onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
      {!description ? undefined : <Text style={styles.contentText}>
        {description}
      </Text>}

      <View>
        {screenWidth === 0 ? <View style={{ height: styles.label.minHeight }} /> :
          <MultiSlider values={[sliderValue]}
                       min={50}
                       max={200}
                       sliderLength={screenWidth}
                       enableLabel={true}
                       customLabel={SliderLabel}
                       containerStyle={styles.slider}
                       trackStyle={styles.track}
                       selectedStyle={styles.trackSelected}
                       markerStyle={styles.marker}
                       pressedMarkerStyle={styles.markerPressed}
                       onValuesChangeFinish={values => {
                         setSliderValue(Math.round(values[0]));
                       }} />
        }
      </View>
    </View>
  </ConfirmationModal>;
};

export default SliderComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {
    alignSelf: "stretch",
    minWidth: "80%"
  },
  contentText: {
    paddingTop: 10,
    paddingBottom: 20,
    color: colors.text
  },

  slider: {
    top: 25,
    position: "absolute"
  },

  track: {
    borderRadius: 1,
    height: 2,
    backgroundColor: colors.borderVariant
  },
  trackSelected: {
    backgroundColor: colors.primary
  },
  marker: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 20,
    height: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 2
  },
  markerPressed: {
    width: 25,
    height: 25
  },
  label: {
    width: 55,
    minHeight: 70,
    textAlign: "center",
    fontSize: 16,
    color: colors.text
  }
});
