import React from "react";
import HeaderIconButton from "../../../components/HeaderIconButton";

interface Props {
  onPress: () => void;

}

const HeaderIconVersePicker: React.FC<Props> = ({ onPress }) => {
  return <HeaderIconButton icon={"list-ol"}
                           onPress={onPress} />;
};

export default HeaderIconVersePicker;
