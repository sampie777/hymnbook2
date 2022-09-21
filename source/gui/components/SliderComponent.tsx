import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MultiSlider, { LabelProps } from "@ptomasroos/react-native-multi-slider";
import { ThemeContextProps, useTheme } from "./ThemeProvider";

const SliderLabel: React.FC<LabelProps> = ({ oneMarkerValue, oneMarkerLeftPosition }) => {
  const styles = createStyles(useTheme());
  return <Text style={[styles.label, { left: oneMarkerLeftPosition - 55 / 2 + 7 }]}>
    {oneMarkerValue} %
  </Text>;
};

interface Props {
  value: number,
  onValueChanged?: (value: number) => void,
  onValueChange?: (value: number) => void,
  minValue?: number,
  maxValue?: number,
  onReset?: () => void;
}

const SliderComponent: React.FC<Props> = ({
                                            value,
                                            onValueChanged,
                                            onValueChange,
                                            minValue = 50,
                                            maxValue = 200,
                                            onReset
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
                     sliderLength={screenWidth}
                     enableLabel={true}
                     customLabel={SliderLabel}
                     containerStyle={styles.slider}
                     trackStyle={styles.track}
                     selectedStyle={styles.trackSelected}
                     markerStyle={styles.marker}
                     pressedMarkerStyle={styles.markerPressed}
                     onValuesChange={values => onValueChange?.(Math.round(values[0]))}
                     onValuesChangeFinish={values => onValueChanged?.(Math.round(values[0]))} />
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
    width: 60,
    minHeight: 70,
    textAlign: "center",
    fontSize: 16,
    color: colors.text
  },

  resetContainer: {
    marginTop: 10
  },
  resetText: {
    color: colors.url
  }
});
