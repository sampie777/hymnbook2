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
import { NativeStackNavigationProp } from "react-native-screens/src/native-stack/types";
import { CollectionChangeCallback } from "realm";
import Db from "./logic/db/db";
import Settings from "./settings";
import { ParamList, routes } from "./navigation";
import { SongListModelSchema } from "./logic/db/models/SongListModelSchema";
import { closeDatabases, initDatabases } from "./logic/app";
import ThemeProvider, { ThemeContextProps, useTheme } from "./gui/components/ThemeProvider";
import SongList from "./logic/songs/songList";
import Icon from "react-native-vector-icons/FontAwesome5";
import ErrorBoundary from "./gui/components/ErrorBoundary";
import HeaderIconButton from "./gui/components/HeaderIconButton";
import LoadingOverlay from "./gui/components/LoadingOverlay";
import SearchScreen from "./gui/screens/search/SearchScreen";
import SongDisplayScreen from "./gui/screens/songDisplay/SongDisplayScreen";
import DownloadSongsScreen from "./gui/screens/downloads/DownloadSongsScreen";
import DownloadDocumentsScreen from "./gui/screens/downloads/DownloadDocumentsScreen";
import SettingsScreen from "./gui/screens/settings/SettingsScreen";
import SongListScreen from "./gui/screens/songlist/SongListScreen";
import AboutScreen from "./gui/screens/about/AboutScreen";
import PrivacyPolicyScreen from "./gui/screens/about/PrivacyPolicyScreen";
import VersePicker from "./gui/screens/songDisplay/VersePicker/VersePicker";
import OtherMenuScreen from "./gui/screens/otherMenu/OtherMenuScreen";
import DocumentSearchScreen from "./gui/screens/search/documents/DocumentSearchScreen";
import SingleDocument from "./gui/screens/documentDisplay/SingleDocument";
import SongListMenuIcon from "./gui/screens/songlist/SongListMenuIcon";


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
    <RootNav.Screen name={routes.Home} component={HomeNavigation}
                    options={{ headerShown: false }} />
    <RootNav.Screen name={routes.Settings} component={SettingsScreen} />
    <RootNav.Screen name={routes.About} component={AboutScreen} />
    <RootNav.Screen name={routes.PrivacyPolicy} component={PrivacyPolicyScreen} />

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

    <RootNav.Screen name={routes.Document} component={SingleDocument}
                    options={{
                      title: ""
                    }}
                    initialParams={{
                      id: undefined
                    }} />

    <RootNav.Screen name={routes.SongImport} component={DownloadSongsScreen}
                    options={({ navigation }: { navigation: NativeStackNavigationProp<ParamList, "SongImport"> }) => ({
                      headerRight: () => !Settings.enableDocumentsFeatureSwitch ? undefined :
                        (<HeaderIconButton icon={"file-alt"}
                                           onPress={() => navigation.navigate(routes.DocumentImport)} />)
                    })} />
    <RootNav.Screen name={routes.DocumentImport} component={DownloadDocumentsScreen}
                    options={({ navigation }: { navigation: NativeStackNavigationProp<ParamList, "DocumentImport"> }) => ({
                      headerRight: () => (<HeaderIconButton icon={"music"}
                                                            onPress={() => navigation.navigate(routes.SongImport)} />)
                    })} />
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

  return (<HomeNav.Navigator initialRouteName={routes.SongSearch}
                             screenOptions={{
                               tabBarStyle: styles.tabBar,
                               tabBarInactiveTintColor: styles.tabBarInactiveLabel.color as string,
                               tabBarActiveTintColor: styles.tabBarActiveLabel.color as string,
                               headerStyle: styles.tabBarHeader,
                               headerTitleStyle: styles.tabBarHeaderTitle
                             }}>
    <HomeNav.Screen name={routes.SongSearch} component={SearchScreen}
                    options={{
                      headerShown: false,
                      tabBarIcon: ({ focused, color, size }) =>
                        <Icon name="music" size={size} color={color} style={styles.tabIcon} />
                    }} />
    <HomeNav.Screen name={routes.SongList} component={SongListScreen}
                    options={{
                      tabBarBadge: Settings.showSongListCountBadge && songListSize > 0 ? songListSize : undefined,
                      tabBarBadgeStyle: styles.tabBarBadgeStyle,
                      tabBarIcon: ({ focused, color, size }) =>
                        <SongListMenuIcon size={size} color={color} style={styles.tabIcon} />
                    }} />
    {!Settings.enableDocumentsFeatureSwitch ? undefined :
      <HomeNav.Screen name={routes.DocumentSearch} component={DocumentSearchScreen}
                      options={{
                        tabBarIcon: ({ focused, color, size }) =>
                          <Icon name="file-alt" size={size} color={color} style={styles.tabIcon} />
                      }} />
    }
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
    initDatabases(theme)
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onExit = () => {
    closeDatabases();
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

    <StatusBar barStyle={!theme.isDark ? "dark-content" : "default"}
               backgroundColor={theme.colors.background}
               hidden={false} />
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
    backgroundColor: colors.background
  },

  tabBar: {
    paddingBottom: 10,
    paddingTop: 7,
    height: 60,
    backgroundColor: colors.surface1,
    borderTopColor: colors.background
  },

  tabBarHeader: {
    backgroundColor: colors.surface1 as string
  },
  tabBarHeaderTitle: {
    color: colors.textHeader as string
  },

  tabBarInactiveLabel: {
    color: colors.textLighter
  },
  tabBarActiveLabel: {
    color: colors.primary
  },
  tabIcon: {},
  tabBarBadgeStyle: {
    left: 2,
    top: -1,
    fontSize: 12,
    height: 18,
    minWidth: 18,
    backgroundColor: colors.primary,
    lineHeight: 17
  }
});
