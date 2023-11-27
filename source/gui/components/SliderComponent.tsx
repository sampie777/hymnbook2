import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MultiSlider, { LabelProps } from "@ptomasroos/react-native-multi-slider";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

const SliderLabel: React.FC<LabelProps & { suffix?: string | undefined }> = ({
                                                                               oneMarkerValue,
                                                                               oneMarkerLeftPosition,
                                                                               suffix
                                                                             }) => {
  const styles = createStyles(useTheme());
  return <Text style={[styles.label]}>
    {oneMarkerValue} {suffix}
  </Text>;
};

interface Props {
  value: number,
  onValueChanged?: (value: number) => void,
  onValueChange?: (value: number) => void,
  minValue?: number,
  maxValue?: number,
  step?: number,
  onReset?: () => void;
  suffix?: string | undefined;
}

const SliderComponent: React.FC<Props> = ({
                                            value,
                                            onValueChanged,
                                            onValueChange,
                                            minValue = 50,
                                            maxValue = 200,
                                            step = 1,
                                            onReset,
                                            suffix = "%"
                                          }) => {
  const [screenWidth, setScreenWidth] = useState(0);
  const styles = createStyles(useTheme());

  return <View style={styles.container}
               onLayout={(e) => setScreenWidth(e.nativeEvent.layout.width)}>
    <View>
      {screenWidth === 0 ? <View style={{ height: styles.label.minHeight }} /> :
        <MultiSlider values={[value]}
                     min={minValue}
                     max={maxValue}
                     step={step}
                     sliderLength={screenWidth}
                     allowOverlap={true}
                     enableLabel={true}
                     customLabel={props => <SliderLabel {...props} suffix={suffix} />}
                     containerStyle={styles.slider}
                     trackStyle={styles.track}
                     selectedStyle={styles.trackSelected}
                     markerStyle={styles.marker}
                     pressedMarkerStyle={styles.markerPressed}
                     markerHitSlop={{ top: 40, right: 75, bottom: 20, left: 75 }}
                     onValuesChange={values => onValueChange?.(values[0])}
                     onValuesChangeFinish={values => onValueChanged?.(values[0])} />
      }
    </View>

    {onReset === undefined ? undefined :
      <TouchableOpacity style={styles.resetContainer}
                        onPress={onReset}>
        <Text style={styles.resetText}>Reset value</Text>
      </TouchableOpacity>
    }
  </View>;
};

export default SliderComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {},

  slider: {
    top: 25,
    position: "absolute"
  },

  track: {
    borderRadius: 1,
    height: 2,
    backgroundColor: colors.border.variant
  },
  trackSelected: {
    backgroundColor: colors.primary.default
  },
  marker: {
    backgroundColor: colors.primary.default,
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
    minHeight: 70,
    textAlign: "center",
    fontSize: 16,
    color: colors.text.default
  },

  resetContainer: {
    marginTop: 10
  },
  resetText: {
    color: colors.url
  }
});
