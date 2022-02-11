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
import { createNativeStackNavigator, NativeStackNavigationProp } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CollectionChangeCallback } from "realm";
import Db from "./scripts/db/db";
import Settings from "./settings";
import { routes } from "./navigation";
import { SongListModelSchema } from "./models/SongListModelSchema";
import { closeDatabases, initDatabases } from "./scripts/app";
import ThemeProvider, { ThemeContextProps, useTheme } from "./components/ThemeProvider";
import SongList from "./scripts/songs/songList";
import Icon from "react-native-vector-icons/FontAwesome5";
import ErrorBoundary from "./components/ErrorBoundary";
import HeaderIconButton from "./components/HeaderIconButton";
import LoadingOverlay from "./components/LoadingOverlay";
import SearchScreen from "./screens/Search/SearchScreen";
import SongDisplayScreen from "./screens/SongDisplay/SongDisplayScreen";
import DownloadSongsScreen from "./screens/downloads/DownloadSongsScreen";
import DownloadDocumentsScreen from "./screens/downloads/DownloadDocumentsScreen";
import SettingsScreen from "./screens/Settings/SettingsScreen";
import SongListScreen from "./screens/songlist/SongListScreen";
import AboutScreen from "./screens/about/AboutScreen";
import PrivacyPolicyScreen from "./screens/about/PrivacyPolicyScreen";
import VersePicker from "./screens/SongDisplay/VersePicker/VersePicker";
import OtherMenuScreen from "./screens/OtherMenuScreen/OtherMenuScreen";
import DocumentSearchScreen from "./screens/Search/documents/DocumentSearchScreen";
import SingleDocument from "./screens/Document/SingleDocument";


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
    <RootNav.Screen name={routes.Settings} component={SettingsScreen} />
    <RootNav.Screen name={routes.About} component={AboutScreen} />
    <RootNav.Screen name={routes.PrivacyPolicy} component={PrivacyPolicyScreen} />
    <RootNav.Screen name={routes.DocumentSearch} component={DocumentSearchScreen} />

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
                    options={({ navigation }: { navigation: NativeStackNavigationProp<any> }) => ({
                      headerRight: () => !Settings.enableDocumentsFeatureSwitch ? undefined :
                        (<HeaderIconButton icon={"file-alt"}
                                           onPress={() => navigation.navigate(routes.DocumentImport)} />)
                    })} />
    <RootNav.Screen name={routes.DocumentImport} component={DownloadDocumentsScreen}
                    options={({ navigation }: { navigation: NativeStackNavigationProp<any> }) => ({
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
