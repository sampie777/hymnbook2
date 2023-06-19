import React from "react";
import HeaderIconButton from "../../../components/HeaderIconButton";

interface Props {
  onPress: () => void;

}

const HeaderIconVersePicker: React.FC<Props> = ({ onPress }) => {
  return <HeaderIconButton icon={"list-ol"}
                           onPress={onPress}
                           hitSlop={{top: 10, right: 15, bottom: 10, left: 0}} />;
};

export default HeaderIconVersePicker;
