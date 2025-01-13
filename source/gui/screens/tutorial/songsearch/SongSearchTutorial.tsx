import React, { useState } from "react";
import { StyleProp, TextStyle } from "react-native";
import SongSearchTutorialButtons from "./SongSearchTutorialButtons";
import SongSearchTutorialList from "./SongSearchTutorialList";

export const songSearchTutorialPage = ({
                                         backgroundColor,
                                         subTitleStyles
                                       }:
                                       {
                                         backgroundColor: string,
                                         subTitleStyles?: StyleProp<TextStyle> | undefined
                                       }) => {
  const [hasPressedAnItem, setHasPressedAnItem] = useState(false);
  const [hasLongPressedAnItem, setHasLongPressedAnItem] = useState(false);
  const [hasAddedAnItem, setHasAddedAnItem] = useState(false);
  const [hasLongAddedAnItem, setHasLongAddedAnItem] = useState(false);

  return {
    backgroundColor: backgroundColor,
    image: <SongSearchTutorialButtons hasPressedAnItem={hasPressedAnItem}
                                      setHasPressedAnItem={setHasPressedAnItem}
                                      hasLongPressedAnItem={hasLongPressedAnItem}
                                      setHasLongPressedAnItem={setHasLongPressedAnItem}
                                      hasAddedAnItem={hasAddedAnItem}
                                      setHasAddedAnItem={setHasAddedAnItem}
                                      hasLongAddedAnItem={hasLongAddedAnItem}
                                      setHasLongAddedAnItem={setHasLongAddedAnItem} />,
    title: 'Songs',
    subtitle: <SongSearchTutorialList subTitleStyles={subTitleStyles}
                                      hasPressedAnItem={hasPressedAnItem}
                                      hasLongPressedAnItem={hasLongPressedAnItem}
                                      hasAddedAnItem={hasAddedAnItem}
                                      hasLongAddedAnItem={hasLongAddedAnItem} />
  }
}