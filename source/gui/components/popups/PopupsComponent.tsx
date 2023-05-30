import React, { useEffect, useState } from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import Db from "../../../logic/db/db";
import { ParamList } from "../../../navigation";
import { SongSchema } from "../../../logic/db/models/SongsSchema";
import { Survey } from "../../../logic/survey";
import { StyleSheet, View } from "react-native";
import InitDatabaseComponent from "./InitDatabaseComponent";
import SurveyModal from "./SurveyModal";

interface ComponentProps {
  navigation: BottomTabNavigationProp<ParamList>,
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
      <SurveyModal onCompleted={() => setShowSurvey(false)}
                   onDenied={() => setShowSurvey(false)} />
    }
  </View>);
};

export default PopupsComponent;


const styles = StyleSheet.create({
  container: {
    position: "absolute"
  }
});
