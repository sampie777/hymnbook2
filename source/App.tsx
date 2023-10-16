/**
 * Hymnbook
 * https://github.com/sampie777/hymnbook2
 *
 * @format
 * @flow strict-local
 */

import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CollectionChangeCallback } from "realm";
import Db from "./logic/db/db";
import Settings from "./settings";
import {
  AboutRoute, DatabasesRoute, DocumentRoute, DocumentSearchRoute,
  HomeRoute, OtherMenuRoute,
  ParamList,
  PrivacyPolicyRoute,
  SettingsRoute, SongListRoute,
  SongRoute, SongSearchRoute, SongStringSearchRoute,
  VersePickerRoute
} from "./navigation";
import { SongListModelSchema } from "./logic/db/models/SongListModelSchema";
import { ServerAuth } from "./logic/server/auth";
import {
  closeDatabases,
  initDocumentDatabase,
  initSettingsDatabase,
  initSongDatabase
} from "./logic/app";
import ThemeProvider, { ThemeContextProps, useTheme } from "./gui/components/ThemeProvider";
import { Types } from "./gui/screens/downloads/TypeSelectBar";
import { runAsync } from "./logic/utils";
import SongList from "./logic/songs/songList";
import Icon from "react-native-vector-icons/FontAwesome5";
import ErrorBoundary from "./gui/components/ErrorBoundary";
import LoadingOverlay from "./gui/components/LoadingOverlay";
import SearchScreen from "./gui/screens/songs/search/SearchScreen";
import SongDisplayScreen from "./gui/screens/songs/song/SongDisplayScreen";
import SettingsScreen from "./gui/screens/settings/SettingsScreen";
import SongListScreen from "./gui/screens/songlist/SongListScreen";
import AboutScreen from "./gui/screens/about/AboutScreen";
import PrivacyPolicyScreen from "./gui/screens/about/PrivacyPolicyScreen";
import VersePicker from "./gui/screens/songs/song/VersePicker/VersePicker";
import OtherMenuScreen from "./gui/screens/otherMenu/OtherMenuScreen";
import DocumentSearchScreen from "./gui/screens/documents/search/DocumentSearchScreen";
import SingleDocument from "./gui/screens/documents/document/SingleDocument";
import SongListMenuIcon from "./gui/screens/songlist/SongListMenuIcon";
import DownloadsScreen from "./gui/screens/downloads/DownloadsScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StringSearchScreen from "./gui/screens/songs/stringSearch/StringSearchScreen";
import FeaturesProvider from "./gui/components/FeaturesProvider";
import DeepLinkHandler from "./gui/components/DeepLinkHandler";
import { MenuProvider } from "react-native-popup-menu";
import AudioPlayer from "./gui/screens/songs/song/melody/audiofiles/AudioPlayer";

const RootNav = createNativeStackNavigator<ParamList>();
const HomeNav = createBottomTabNavigator<ParamList>();

const RootNavigation = () => {
  const styles = createStyles(useTheme());
  return <RootNav.Navigator initialRouteName={HomeRoute}
                            screenOptions={{
                              headerStyle: styles.tabBarHeader,
                              headerTitleStyle: styles.tabBarHeaderTitle,
                              headerTintColor: styles.tabBarHeaderTitle.color
                            }}>
    <RootNav.Screen name={HomeRoute} component={HomeNavigation}
                    options={{ headerShown: false }} />
    <RootNav.Screen name={SettingsRoute} component={SettingsScreen} />
    <RootNav.Screen name={AboutRoute} component={AboutScreen} />
    <RootNav.Screen name={PrivacyPolicyRoute} component={PrivacyPolicyScreen} options={{ title: "Privacy policy" }} />

    <RootNav.Screen name={SongStringSearchRoute} component={StringSearchScreen}
                    options={{
                      title: "Search through songs"
                    }} />
    <RootNav.Screen name={SongRoute} component={SongDisplayScreen}
                    options={{
                      animation: Settings.songFadeIn ? undefined : "none",
                      title: ""
                    }}
                    initialParams={{
                      id: undefined,
                      songListIndex: undefined,
                      selectedVerses: []
                    }} />
    <RootNav.Screen name={VersePickerRoute} component={VersePicker}
                    options={{
                      title: "Select verses..."
                    }}
                    initialParams={{
                      verses: undefined,
                      selectedVerses: []
                    }} />

    <RootNav.Screen name={DocumentRoute} component={SingleDocument}
                    options={{
                      animation: Settings.songFadeIn ? undefined : "none",
                      title: ""
                    }}
                    initialParams={{
                      id: undefined
                    }} />

    <RootNav.Screen name={DatabasesRoute} component={DownloadsScreen}
                    initialParams={{
                      type: Types.Songs
                    }} />
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

  const onCollectionChange: CollectionChangeCallback<Object> = () => {
    setSongListSize(SongList.list().length);
  };

  return <HomeNav.Navigator initialRouteName={SongSearchRoute}
                            screenOptions={{
                              tabBarStyle: styles.tabBar,
                              tabBarInactiveTintColor: styles.tabBarInactiveLabel.color as string,
                              tabBarActiveTintColor: styles.tabBarActiveLabel.color as string,
                              headerStyle: styles.tabBarHeader,
                              headerTitleStyle: styles.tabBarHeaderTitle,
                              tabBarItemStyle: styles.tabBarItem
                            }}>
    <HomeNav.Screen name={SongSearchRoute} component={SearchScreen}
                    options={{
                      title: "Songs",
                      headerShown: false,
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="music" size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={SongListRoute} component={SongListScreen}
                    options={{
                      title: "Song list",
                      tabBarBadge: Settings.showSongListCountBadge && songListSize > 0 ? songListSize : undefined,
                      tabBarBadgeStyle: styles.tabBarBadgeStyle,
                      tabBarIcon: ({ focused, color, size }) =>
                        <SongListMenuIcon size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={DocumentSearchRoute} component={DocumentSearchScreen}
                    options={{
                      title: "Documents",
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="file-alt" size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={OtherMenuRoute} component={OtherMenuScreen}
                    options={{
                      title: "More",
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="bars" size={size} color={color} style={styles.tabIcon} />
                    }} />
  </HomeNav.Navigator>;
};

const AppRoot: React.FC = () => {
  const [isSettingsDbLoading, setIsSettingsDbLoading] = useState(true);
  const [isSongDbLoading, setIsSongDbLoading] = useState(true);
  const [isDocumentDbLoading, setIsDocumentDbLoading] = useState(true);
  const theme = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    runAsync(() => initSettingsDatabase(theme)
      .then(() => {
        // Don't return, as that will hold up the app loading. Authentication should be done async.
        ServerAuth.authenticate()
          .catch(error => Alert.alert(
            "Authenticating error",
            "Failed to authenticate with song server.\nThis is normally only done once after app install.\n\n" + error
          ));
      })
      .finally(() => setIsSettingsDbLoading(false)));
    runAsync(() => initSongDatabase().finally(() => setIsSongDbLoading(false)));
    runAsync(() => initDocumentDatabase().finally(() => setIsDocumentDbLoading(false)));
  };

  const onExit = () => {
    closeDatabases();
  };

  const isLoading = isSettingsDbLoading || isSongDbLoading || isDocumentDbLoading;

  return <SafeAreaView style={styles.container}>
    <LoadingOverlay isVisible={isLoading} />

    {isLoading ? undefined :
      <NavigationContainer>
        <DeepLinkHandler>
          <RootNavigation />
        </DeepLinkHandler>
      </NavigationContainer>
    }

    <StatusBar barStyle={!theme.isDark ? "dark-content" : "light-content"}
               backgroundColor={theme.colors.background}
               hidden={false} />
  </SafeAreaView>;
};

const App = () =>
  <ErrorBoundary>
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FeaturesProvider>
        <ThemeProvider>
          <MenuProvider>
            <AudioPlayer>
              <AppRoot />
            </AudioPlayer>
          </MenuProvider>
        </ThemeProvider>
      </FeaturesProvider>
    </GestureHandlerRootView>
  </ErrorBoundary>;

const createStyles = ({ colors, isDark }: ThemeContextProps) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },

  tabBar: {
    height: 60,
    backgroundColor: colors.surface1,
    borderTopColor: colors.background
  },

  tabBarHeader: {
    backgroundColor: colors.surface1 as string,
    shadowOpacity: isDark ? 0 : 1,
    elevation: isDark ? 2 : 4
  },
  tabBarHeaderTitle: {
    color: colors.text.header as string
  },

  tabBarItem: {
    paddingBottom: 10,
    paddingTop: 7
  },
  tabBarInactiveLabel: {
    color: colors.text.lighter
  },
  tabBarActiveLabel: {
    color: colors.primary.default
  },
  tabIcon: {},
  tabBarBadgeStyle: {
    left: 2,
    top: -1,
    fontSize: 12,
    height: 18,
    minWidth: 18,
    backgroundColor: colors.primary.default,
    lineHeight: 17
  }
});

export default App;
