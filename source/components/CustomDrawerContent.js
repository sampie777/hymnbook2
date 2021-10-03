import React from "react";
import {
  DrawerContentScrollView, DrawerItem,
} from "@react-navigation/drawer";
import { CommonActions, DrawerActions, useLinkBuilder } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { displayName } from './../../app.json';
import Icon from "react-native-vector-icons/FontAwesome5";
import { getVersion } from "react-native-device-info";

/**
 *
 * This function is from the default code: https://github.com/react-navigation/react-navigation/blob/main/packages/drawer/src/views/DrawerItemList.tsx

 * I've added a line to hide some routes in the menu.
 * To use this added feature, set the `hideInMenu` parameter in the routes `options`, like so:
 * ```
 * <Drawer.Screen options={{hideInMenu=true}} ... />
 * ```
 * @param state
 * @param navigation
 * @param descriptors
 * @returns {*}
 * @constructor
 */
function CustomDrawerItemList({ state, navigation, descriptors }) {
  const buildLink = useLinkBuilder();

  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor.options;

  const {
    drawerActiveTintColor,
    drawerInactiveTintColor,
    drawerActiveBackgroundColor,
    drawerInactiveBackgroundColor,
  } = focusedOptions;

  return state.routes
    .filter((it) => !descriptors[it.key].options.hideInMenu)  // Added this to the default code
    .map((route, i) => {
      const focused = i === state.index;
      const {
        title,
        drawerLabel,
        drawerIcon,
        drawerLabelStyle,
        drawerItemStyle,
      } = descriptors[route.key].options;

      return (
        <DrawerItem
          key={route.key}
          label={
            drawerLabel !== undefined
              ? drawerLabel
              : title !== undefined
                ? title
                : route.name
          }
          icon={drawerIcon}
          focused={focused}
          activeTintColor={drawerActiveTintColor}
          inactiveTintColor={drawerInactiveTintColor}
          activeBackgroundColor={drawerActiveBackgroundColor}
          inactiveBackgroundColor={drawerInactiveBackgroundColor}
          labelStyle={drawerLabelStyle}
          style={drawerItemStyle}
          to={buildLink(route.name, route.params)}
          onPress={() => {
            navigation.dispatch({
              ...(focused
                ? DrawerActions.closeDrawer()
                : CommonActions.navigate({ name: route.name, merge: true })),
              target: state.key,
            });
          }}
        />
      );
    });
}

function Header() {
  return (
    <View style={styles.headerContainer}>
      <Icon name={"book-open"} size={styles.headerIcon.fontSize} color={styles.headerIcon.color} />
      <Text style={styles.headerContent}>{displayName}</Text>
    </View>
  );
}

function Footer() {
  return (
    <View style={styles.footerContainer}>
      <Text style={styles.footerContent}>version: {getVersion()} {process.env.NODE_ENV === "production" ? undefined : `(${process.env.NODE_ENV})`}</Text>
    </View>
  );
}

export default function CustomDrawerContent(props) {
  return (<>
      <Header />
      <DrawerContentScrollView {...props}>
        <CustomDrawerItemList {...props} />
      </DrawerContentScrollView>
      <Footer />
    </>
  );
}


const styles = StyleSheet.create({
  headerContainer: {
    alignSelf: "stretch",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 10,
    paddingTop: 25,
    paddingBottom: 15,
    flexDirection: "row",
  },
  headerIcon: {
    color: "dodgerblue",
    fontSize: 30,
  },
  headerContent: {
    paddingLeft: 18,
    color: "dodgerblue",
    fontSize: 28,
    fontFamily: "sans-serif-light",
  },
  footerContainer: {
    alignSelf: "stretch",
    padding: 10,
  },
  footerContent: {
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
    fontFamily: "sans-serif-light",
  }
});
