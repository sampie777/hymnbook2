import React from "react";
import Db from "../../scripts/db/db";
import { NativeStackNavigationProp } from "react-native-screens/src/native-stack/types";
import { DocumentSchema } from "../../models/DocumentsSchema";
import { ParamList, routes } from "../../navigation";
import { Document } from "../../models/Documents";
import { ThemeContextProps, useTheme } from "../../components/ThemeProvider";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

interface Props {
  navigation: NativeStackNavigationProp<ParamList>
  document?: Document;
}

const DocumentControls: React.FC<Props> =
  ({
     navigation,
     document
   }) => {
    const styles = createStyles(useTheme());

    const getPreviousDocument = () => {
      if (document === undefined || document.index <= 0) {
        return undefined;
      }

      const documents = Db.documents.realm().objects<Document>(DocumentSchema.name)
        .filtered(`index < ${document.index} AND _parent.id = ${Document.getParent(document)?.id || 0}`)
        .sorted("index", true);

      if (documents === undefined || documents === null || documents.length === 0) {
        return undefined;
      }

      return documents[0];
    };

    const getNextDocument = () => {
      if (document === undefined || document.index < 0) {
        return undefined;
      }

      const documents = Db.documents.realm().objects<Document>(DocumentSchema.name)
        .filtered(`index > ${document.index} AND _parent.id = ${Document.getParent(document)?.id || 0}`)
        .sorted("index");

      if (documents === undefined || documents === null || documents.length === 0) {
        return undefined;
      }

      return documents[0];
    };

    const previousDocument = getPreviousDocument();
    const nextDocument = getNextDocument();

    const goToDocument = (doc: Document) => {
      navigation.navigate(routes.Document, {
        id: doc.id
      });
    };

    return (<View style={styles.container}>

      {previousDocument === undefined ? undefined :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToDocument(previousDocument)}>
          <Icon name={"chevron-left"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }

      <View style={styles.horizontalGap} />

      {nextDocument === undefined ?
        (document === undefined ? undefined : <View style={styles.buttonBase} />) :
        <TouchableOpacity style={[styles.buttonBase, styles.button]}
                          onPress={() => goToDocument(nextDocument)}>
          <Icon name={"chevron-right"}
                color={styles.buttonText.color as string}
                size={styles.buttonText.fontSize}
                style={styles.buttonText} />
        </TouchableOpacity>
      }
    </View>);
  };

export default DocumentControls;

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  container: {
    alignItems: "center",
    flexDirection: "row",
    position: "absolute",
    width: "100%",
    bottom: 30,
    paddingHorizontal: 20
  },

  buttonBase: {
    width: 45,
    height: 45,
    marginHorizontal: 10
  },
  button: {
    backgroundColor: colors.primaryVariant,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",

    zIndex: 10,
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  buttonDisabled: {
    backgroundColor: colors.buttonVariant,
    elevation: 2
  },
  buttonInvert: {
    backgroundColor: colors.button
  },

  buttonText: {
    color: colors.onPrimary,
    fontSize: 18
  },
  buttonTextDisabled: {
    opacity: 0.3,
    color: colors.textLighter
  },
  buttonInvertText: {
    color: colors.textLighter
  },

  horizontalGap: {
    flex: 1
  }
});
