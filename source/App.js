/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import { routes } from "./navigation";
import SearchScreen from "./screens/Search/SearchScreen";
import SongDisplayScreen from "./screens/SongDisplay/SongDisplayScreen";
import Db from "./scripts/db/db";
import CustomDrawerContent from "./components/CustomDrawerContent";
import Icon from "react-native-vector-icons/FontAwesome";
import DownloadSongsScreen from "./screens/DownloadSongs/DownloadSongsScreen";
import Settings from "./scripts/settings";
import SettingsScreen from "./screens/Settings/SettingsScreen";
import SongListScreen from "./screens/SongListScreen";
import ErrorBoundary from "./components/ErrorBoundary";
import { rollbar } from "./scripts/rollbar";
import AboutScreen from "./screens/about/AboutScreen";
import SurveyComponent from "./components/Survey/SurveyComponent";
import { Survey } from "./scripts/survey";

const Drawer = createDrawerNavigator();

export default function App() {
  const [showSurvey, setShowSurvey] = useState(Survey.needToShow);

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
      });

    Db.songs.connect()
      .catch(e => {
        rollbar.error("Could not connect to local song database: " + e.toString(), e);
        alert("Could not connect to local song database: " + e);
      });
  };

  const onExit = () => {
    Settings.store();
    Db.songs.disconnect();
    Db.settings.disconnect();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ErrorBoundary>
        {!showSurvey ? undefined :
          <SurveyComponent onCompleted={() => setShowSurvey(false)}
                           onDenied={() => setShowSurvey(false)} />
        }

        {showSurvey ? undefined :
          <NavigationContainer>
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

              {/* Hidden screens */}
              <Drawer.Screen name={routes.Song} component={SongDisplayScreen}
                             initialParams={{
                               id: undefined,
                               previousScreen: undefined,
                               songListIndex: undefined,
                             }}
                             options={{
                               hideInMenu: true,
                             }} />
            </Drawer.Navigator>
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
