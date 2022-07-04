import React from "react";
import { View, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

function App() {
  return <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <Text style={{color: 'black'}}>Hi, I'm here for you</Text>
    <Text style={{color: 'black', fontFamily: 'Roboto Light'}}>Hi, I'm here for you</Text>
    <Icon name="file-alt" />
  </View>;
}

export default App;
