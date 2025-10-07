import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { StyleProp } from "react-native/Libraries/StyleSheet/StyleSheet";
import { ViewStyle } from "react-native/Libraries/StyleSheet/StyleSheetTypes";
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ImFeelingLucky from "./ImFeelingLucky";
import { ParamList } from "../../../../../navigation";

type Props = {
  navigation: BottomTabNavigationProp<ParamList>
  contentContainerStyle: StyleProp<ViewStyle>
  selectedBundleUuids: string[]
};

const EasterEggList: React.FC<Props> = ({
                                          navigation,
                                          contentContainerStyle,
                                          selectedBundleUuids
                                        }) => {
  const styles = createStyles();

  return <ScrollView style={styles.container}
                     contentContainerStyle={contentContainerStyle}>
    <ImFeelingLucky navigation={navigation}
                    selectedBundleUuids={selectedBundleUuids} />
  </ScrollView>;
};

export default EasterEggList;

const createStyles = () => StyleSheet.create({
  container: {},
});
