import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ThemeContextProps, useTheme } from "../ThemeProvider";
import ConfirmationModal from "./ConfirmationModal";
import SliderComponent from "../SliderComponent";

interface Props {
  title: string,
  description?: string,
  initialValue: number,
  onCompleted?: (value: number) => void,
  onDenied?: () => void,
  defaultValue?: number,
  minValue?: number,
  maxValue?: number,
}

const SliderPopupComponent: React.FC<Props> = ({
                                                 title,
                                                 description,
                                                 initialValue,
                                                 onCompleted,
                                                 onDenied,
                                                 defaultValue,
                                                 minValue = 50,
                                                 maxValue = 200
                                               }) => {
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
    <View style={styles.popupContent}>
      {!description ? undefined :
        <Text style={styles.contentText}>
          {description}
        </Text>}

      <SliderComponent value={sliderValue}
                       onValueChanged={setSliderValue}
                       onReset={defaultValue === undefined ? undefined : () => setSliderValue(defaultValue)}
                       minValue={minValue}
                       maxValue={maxValue} />
    </View>
  </ConfirmationModal>;
};

export default SliderPopupComponent;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  popupContent: {
    alignSelf: "stretch",
    minWidth: "80%",
    marginBottom: -15
  },
  contentText: {
    paddingTop: 10,
    paddingBottom: 20,
    color: colors.text.default
  }
});
