/**
 * @format
 */

import 'react-native-get-random-values';
import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import App from "./source/App";

AppRegistry.registerComponent(appName, () => App);
