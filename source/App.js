/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { routes } from "./navigation";
import Db from "./scripts/db/db";
import Icon from "react-native-vector-icons/FontAwesome";
import Settings from "./scripts/settings";
import { rollbar } from "./scripts/rollbar";
import CustomDrawerContent from "./components/CustomDrawerContent";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingOverlay from "./components/LoadingOverlay";
import SearchScreen from "./screens/Search/SearchScreen";
import SongDisplayScreen from "./screens/SongDisplay/SongDisplayScreen";
import DownloadSongsScreen from "./screens/DownloadSongs/DownloadSongsScreen";
import SettingsScreen from "./screens/Settings/SettingsScreen";
import SongListScreen from "./screens/SongListScreen";
import AboutScreen from "./screens/about/AboutScreen";
import PrivacyPolicyScreen from "./screens/about/PrivacyPolicyScreen";
import VersePicker from "./screens/SongDisplay/VersePicker/VersePicker";


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const RootNavigation = () => (
  <Stack.Navigator initialRouteName={routes.Home}>
    <Stack.Screen name={"Home"} component={HomeNavigation}
                  options={{ headerShown: false }} />

    {/* Hidden screens */}
    <Stack.Screen name={routes.Song} component={SongDisplayScreen}
                  options={{
                    title: "",
                  }}
                  initialParams={{
                    id: undefined,
                    songListIndex: undefined,
                    selectedVerses: [],
                  }} />
    <Stack.Screen name={routes.VersePicker} component={VersePicker}
                  options={{
                    title: "Select verses...",
                  }}
                  initialParams={{
                    verses: undefined,
                    selectedVerses: [],
                  }} />

    <Stack.Screen name={routes.PrivacyPolicy} component={PrivacyPolicyScreen}
                  options={{
                    hideInMenu: true,
                  }} />
  </Stack.Navigator>
);

const HomeNavigation = () => (
  <Drawer.Navigator initialRouteName={routes.Search}
                    drawerContent={CustomDrawerContent}>
    <Drawer.Screen name={routes.Search} component={SearchScreen}
                   options={{
                     drawerIcon: ({ focused, color, size }) =>
                       <Icon name="search" size={size} color={color} style={styles.drawerIcon} />,
                   }} />
    <Drawer.Screen name={routes.SongList} component={SongListScreen}
                   options={{
                     title: "Song list",
                     drawerIcon: ({ focused, color, size }) =>
                       <Icon name="list-ul" size={size} color={color} style={styles.drawerIcon} />,
                   }} />
    <Drawer.Screen name={routes.Import} component={DownloadSongsScreen}
                   options={{
                     drawerIcon: ({ focused, color, size }) =>
                       <Icon name="database" size={size} color={color} style={styles.drawerIcon} />,
                   }} />
    <Drawer.Screen name={routes.Settings} component={SettingsScreen}
                   options={{
                     drawerIcon: ({ focused, color, size }) =>
                       <Icon name="cogs" size={size} color={color} style={styles.drawerIcon} />,
                   }} />
    <Drawer.Screen name={routes.About} component={AboutScreen}
                   options={{
                     drawerIcon: ({ focused, color, size }) =>
                       <Icon name="info" size={size} color={color} style={styles.drawerIcon} />,
                   }} />
  </Drawer.Navigator>
);

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    Db.settings.connect()
      .catch(e => {
        rollbar.error("Could not connect to local settings database: " + e.toString(), e);
        alert("Could not connect to local settings database: " + e);
      })
      .then(() => Settings.load())
      .catch(e => {
        rollbar.error("Could not load settings from database: " + e.toString(), e);
        alert("Could not load settings from database: " + e);
      })
      .then(() => {
        Settings.appOpenedTimes++;
        Settings.store();
      })
      .finally(() =>
        Db.songs.connect()
          .catch(e => {
            rollbar.error("Could not connect to local song database: " + e.toString(), e);
            alert("Could not connect to local song database: " + e);
          })
          .finally(() => {
            setIsLoading(false);
          }),
      );
  };

  const onExit = () => {
    Settings.store();
    Db.songs.disconnect();
    Db.settings.disconnect();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
        <LoadingOverlay isVisible={isLoading} />

        {isLoading ? undefined :
          <NavigationContainer>
            <RootNavigation />
          </NavigationContainer>
        }
      </ErrorBoundary>

      <StatusBar style={"auto"} hidden={false} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawerIcon: {
    width: 30,
    marginRight: -10,
    textAlign: "center",
  },
});
