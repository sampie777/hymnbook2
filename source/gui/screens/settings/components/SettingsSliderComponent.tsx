import React, { useState } from "react";
import Settings from "../../../../settings";
import SliderPopupComponent from "../../../components/popups/SliderPopupComponent";
import { GenericSettingProps, SettingComponent } from "./SettingComponent";

interface NumberSettingProps extends GenericSettingProps<number> {
  defaultValue?: number;
  minValue?: number,
  maxValue?: number,
}

const SettingsSliderComponent: React.FC<NumberSettingProps> = ({
                                                                 title,
                                                                 description,
                                                                 keyName,
                                                                 value,
                                                                 onPress,
                                                                 onLongPress,
                                                                 valueRender,
                                                                 isVisible = true,
                                                                 lessObviousStyling = false,
                                                                 defaultValue,
                                                                 minValue = 0.5,
                                                                 maxValue = 2
                                                               }) => {
  if (!isVisible) {
    return null;
  }

  const [showSlider, setShowSlider] = useState(false);

  if (value === undefined && keyName !== undefined) {
    value = Settings.get(keyName);
  }

  // Keep new value in memory over state changes
  const [_value, _setValue] = useState<number>(value ?? 0);
  const setValue = (newValue: number) => {
    if (keyName !== undefined) {
      // @ts-ignore
      Settings[keyName] = newValue;
      // @ts-ignore
      _setValue(Settings[keyName]);
    } else {
      _setValue(newValue);
    }
  };

  const defaultOnPress = () => {
    setShowSlider(true);
  };

  return (<>
    {!showSlider ? undefined :
      <SliderPopupComponent title={title}
                            description={description}
                            initialValue={Math.round((_value ?? 0) * 100)}
                            onCompleted={value => {
                              setValue(value / 100);
                              setShowSlider(false);
                              if (keyName !== undefined) {
                                _setValue(Settings.get(keyName));
                              }
                            }}
                            onDenied={() => setShowSlider(false)}
                            defaultValue={defaultValue === undefined ? undefined : defaultValue * 100}
                            minValue={minValue * 100}
                            maxValue={maxValue * 100} />
    }
    <SettingComponent<number> title={title}
                              keyName={keyName}
                              value={_value}
                              isVisible={isVisible}
                              onPress={onPress === undefined ? defaultOnPress : onPress}
                              onLongPress={onLongPress === undefined ? defaultOnPress : onLongPress}
                              valueRender={valueRender === undefined ? undefined : () => valueRender?.(_value)}
                              lessObviousStyling={lessObviousStyling} />
  </>);
};

export default SettingsSliderComponent;
