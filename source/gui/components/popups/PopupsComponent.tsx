import React, { useEffect, useState } from "react";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs/src/types";
import Db from "../../../logic/db/db";
import { ParamList, TutorialRoute } from "../../../navigation";
import { SongSchema } from "../../../logic/db/models/SongsSchema";
import { Survey } from "../../../logic/survey";
import { StyleSheet, View } from "react-native";
import SurveyModal from "./SurveyModal";
import { Tutorial } from "../../../logic/tutorial";

interface ComponentProps {
  navigation: BottomTabNavigationProp<ParamList>,
}

const PopupsComponent: React.FC<ComponentProps> = ({ navigation }) => {
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    onLaunch();
  }, []);

  const onLaunch = () => {
    if (Tutorial.needToShow()) {
      navigation.navigate(TutorialRoute);
      return; // Don't show survey if tutorial is shown. Survey can be shown next time.
    }

    if (Db.songs.realm().objects(SongSchema.name).length > 0) {
      setShowSurvey(Survey.needToShow());
    }
  };

  return <View style={styles.container}>
    {!showSurvey ? undefined :
      <SurveyModal onCompleted={() => setShowSurvey(false)}
                   onDenied={() => setShowSurvey(false)} />
    }
  </View>;
};

export default PopupsComponent;


const styles = StyleSheet.create({
  container: {
    position: "absolute"
  }
});
