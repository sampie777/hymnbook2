import React, { useEffect, useState } from "react";
import InitDatabaseComponent from "./InitDatabaseComponent";
import SurveyComponent from "./SurveyComponent";
import { Survey } from "../../scripts/survey";
import Db from "../../scripts/db/db";
import { SongSchema } from "../../models/SongsSchema";
import { DrawerNavigationHelpers } from "@react-navigation/drawer/src/types";
import { StyleSheet, View } from "react-native";

interface ComponentProps {
  navigation: DrawerNavigationHelpers,
}

const PopupsComponent: React.FC<ComponentProps> = ({ navigation }) => {
  const [showSurvey, setShowSurvey] = useState(false);
  const [showInitDatabasePopup, setShowInitDatabasePopup] = useState(false);

  useEffect(() => {
    onLaunch();
  }, []);

  const onLaunch = () => {
    if (Db.songs.realm().objects(SongSchema.name).length === 0) {
      setShowInitDatabasePopup(true);
      setShowSurvey(false);
    } else {
      setShowSurvey(Survey.needToShow());
    }
  };

  return (<View style={styles.container}>
    {!showInitDatabasePopup ? undefined :
      <InitDatabaseComponent navigation={navigation}
                             onCompleted={() => setShowInitDatabasePopup(false)} />
    }

    {!showSurvey || showInitDatabasePopup ? undefined :
      <SurveyComponent onCompleted={() => setShowSurvey(false)}
                       onDenied={() => setShowSurvey(false)} />
    }
  </View>);
};

export default PopupsComponent;


const styles = StyleSheet.create({
  container: {
    position: "absolute",
  },
});