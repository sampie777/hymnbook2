/**
 * Hymnbook
 * https://github.com/sampie777/hymnbook2
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CollectionChangeCallback } from "realm";
import Db from "./scripts/db/db";
import Settings from "./scripts/settings";
import { routes } from "./navigation";
import { rollbar } from "./scripts/rollbar";
import { SongListModelSchema } from "./models/SongListModelSchema";
import SongList from "./scripts/songs/songList";
import Icon from "react-native-vector-icons/FontAwesome";
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
import OtherMenuScreen from "./screens/OtherMenuScreen/OtherMenuScreen";
import ThemeProvider, { ThemeContextProps, useTheme } from "./components/ThemeProvider";


const RootNav = createNativeStackNavigator();
const HomeNav = createBottomTabNavigator();

const RootNavigation = () => {
  const styles = createStyles(useTheme());
  return <RootNav.Navigator initialRouteName={routes.Home}
                            screenOptions={{
                              headerStyle: styles.tabBarHeader,
                              headerTitleStyle: styles.tabBarHeaderTitle,
                              headerTintColor: styles.tabBarHeaderTitle.color
                            }}>
    <RootNav.Screen name={"Home"} component={HomeNavigation}
                    options={{ headerShown: false }} />

    <RootNav.Screen name={routes.Song} component={SongDisplayScreen}
                    options={{
                      title: ""
                    }}
                    initialParams={{
                      id: undefined,
                      songListIndex: undefined,
                      selectedVerses: []
                    }} />
    <RootNav.Screen name={routes.VersePicker} component={VersePicker}
                    options={{
                      title: "Select verses..."
                    }}
                    initialParams={{
                      verses: undefined,
                      selectedVerses: []
                    }} />

    <RootNav.Screen name={routes.Import} component={DownloadSongsScreen} />
    <RootNav.Screen name={routes.Settings} component={SettingsScreen} />
    <RootNav.Screen name={routes.About} component={AboutScreen} />
    <RootNav.Screen name={routes.PrivacyPolicy} component={PrivacyPolicyScreen} />
  </RootNav.Navigator>;
};

const HomeNavigation: React.FC = () => {
  const [songListSize, setSongListSize] = useState(0);
  const styles = createStyles(useTheme());

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    Db.songs.realm().objects(SongListModelSchema.name).addListener(onCollectionChange);
  };

  const onExit = () => {
    Db.songs.realm().objects(SongListModelSchema.name).removeListener(onCollectionChange);
  };

  const onCollectionChange: CollectionChangeCallback<Object> = (songLists, changes) => {
    setSongListSize(SongList.list().length);
  };

  return (<HomeNav.Navigator initialRouteName={routes.Search}
                             screenOptions={{
                               tabBarStyle: styles.tabBar,
                               tabBarInactiveTintColor: styles.tabBarInactiveLabel.color as string,
                               tabBarActiveTintColor: styles.tabBarActiveLabel.color as string,
                               headerStyle: styles.tabBarHeader,
                               headerTitleStyle: styles.tabBarHeaderTitle
                             }}>
    <HomeNav.Screen name={routes.Search} component={SearchScreen}
                    options={{
                      headerShown: false,
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="search" size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={routes.SongList} component={SongListScreen}
                    options={{
                      title: "Song list",
                      tabBarBadge: Settings.showSongListCountBadge && songListSize > 0 ? songListSize : undefined,
                      tabBarBadgeStyle: styles.tabBarBadgeStyle,
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="list-ul" size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={routes.OtherMenu} component={OtherMenuScreen}
                    options={{
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="bars" size={size} color={color} style={styles.tabIcon} />
                    }} />
  </HomeNav.Navigator>);
};

const AppRoot: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const styles = createStyles(theme);

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
        theme.reload()
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
          })
      );
  };

  const onExit = () => {
    Settings.store();
    Db.songs.disconnect();
    Db.settings.disconnect();
  };

  return <SafeAreaView style={styles.container}>
    <ErrorBoundary>
      <LoadingOverlay isVisible={isLoading} />

      {isLoading ? undefined :
        <NavigationContainer>
          <RootNavigation />
        </NavigationContainer>
      }
    </ErrorBoundary>

    <StatusBar barStyle={"default"} hidden={false} />
  </SafeAreaView>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AppRoot />
    </ThemeProvider>
  );
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.height0
  },

  tabBar: {
    paddingBottom: 10,
    paddingTop: 7,
    height: 60,
    backgroundColor: colors.height1,
    borderTopColor: colors.height0
  },

  tabBarHeader: {
    backgroundColor: colors.height1 as string
  },
  tabBarHeaderTitle: {
    color: colors.textHeader as string
  },

  tabBarInactiveLabel: {
    color: colors.text2
  },
  tabBarActiveLabel: {
    color: colors.tint
  },
  tabIcon: {},
  tabBarBadgeStyle: {
    left: 2,
    top: -1,
    fontSize: 12,
    height: 18,
    minWidth: 18,
    backgroundColor: colors.tint
  }
});
