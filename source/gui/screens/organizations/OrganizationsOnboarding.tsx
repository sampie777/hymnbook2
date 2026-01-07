import React, { useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Organization } from "../../../logic/db/models/organizations/Organizations.ts";
import { useIsMounted } from "../../components/utils.ts";
import { isConnectionError } from "../../../logic/apiUtils.ts";
import { Organizations } from "../../../logic/organizations/organizations.ts";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider.tsx";
import { SafeAreaView } from "react-native-safe-area-context";
import OrganizationItem from "./OrganizationItem.tsx";

interface Props {
}

const OrganizationsOnboarding: React.FC<Props> = ({}) => {
  const isMounted = useIsMounted();
  const styles = createStyles(useTheme());

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isServerDataLoading, setIsServerDataLoading] = useState(false);

  useEffect(() => {
    fetchServerData();
  })

  const fetchServerData = async () => {
    setIsServerDataLoading(true);
    try {
      const data = await Organizations.fetchAll();
      if (!isMounted()) return;

      setOrganizations(data);
    } catch (error) {
      if (isConnectionError(error)) {
        Alert.alert("Error", "Could not load organizations. Make sure your internet connection is working or try again later.");
      } else {
        Alert.alert("Error", `Could not load organizations. \n${error}\n\nTry again later.`);
      }
    } finally {
      if (!isMounted()) return;
      setIsServerDataLoading(false);
    }
  };

  return <SafeAreaView style={styles.safeAreaView} edges={['top']}>
    <View style={styles.container}>
      <Text style={styles.informationText}>Choose the organisations/churches you belong to.</Text>

      <ScrollView nestedScrollEnabled={true}
                  style={styles.listContainer}
                  refreshControl={<RefreshControl onRefresh={() => null}
                                                  tintColor={styles.refreshControl.color}
                                                  refreshing={isServerDataLoading} />}>
        {organizations.length > 0 ? undefined :
          <Text style={styles.emptyListText}>
            {isServerDataLoading ? "Loading..." : "No data available..."}
          </Text>
        }

        {organizations.map((organization, index) =>
          <OrganizationItem key={organization.uuid}
                            organization={organization}
                            index={index} />)}
      </ScrollView>
    </View>
  </SafeAreaView>
};

const createStyles = ({ colors }: ThemeContextProps) => StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: colors.background
  },

  informationText: {
    fontSize: 16,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 3,
    color: colors.text.default
  },
  subtleInformationText: {
    color: colors.text.lighter
  },

  listContainer: {
    flex: 1,
    minHeight: 100,
    marginTop: 20,
  },

  emptyListText: {
    padding: 20,
    textAlign: "center",
    color: colors.text.default
  },

  refreshControl: {
    color: colors.text.lighter
  },

  webpageLink: {
    color: colors.url
  }
});

export default OrganizationsOnboarding;
