import { isUuidEmpty } from "../../../logic/utils/utils.ts";
import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { DocumentGroupDetailsRoute, ParamList } from "../../../navigation";
import { DocumentGroup as LocalDocumentGroup } from "../../../logic/db/models/documents/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../../../logic/server/models/Documents";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import { DocumentProcessor } from "../../../logic/documents/documentProcessor";
import { DocumentUpdater } from "../../../logic/documents/updater/documentUpdater";
import { DocumentServer } from "../../../logic/documents/documentServer";
import { rollbar } from "../../../logic/rollbar";
import { DeepLinking } from "../../../logic/deeplinking";
import { languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils/utils.ts";
import { isConnectionError } from "../../../logic/apiUtils";
import Db from "../../../logic/db/db";
import { DocumentGroupSchema } from "../../../logic/db/models/documents/DocumentsSchema";
import SafeText from "../../components/SafeText.tsx";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import Icon from "react-native-vector-icons/FontAwesome5";
import { IsDownloadingIcon } from "./common";
import { useIsMounted } from "../../components/utils";
import { formatDocumentGroupDownloadSize } from "./downloadSize";

interface Props extends NativeStackScreenProps<ParamList, typeof DocumentGroupDetailsRoute> {}

export const getDocumentGroupYear = (group?: { name?: string; createdAt?: string | Date }): string | undefined => {
  if (!group) return undefined;
  const nameYear = group.name?.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  if (nameYear) return nameYear[0];
  if (group.createdAt) {
    const date = new Date(group.createdAt);
    if (!isNaN(date.getFullYear())) {
      return date.getFullYear().toString();
    }
  }
  return undefined;
};

const DocumentGroupDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { groupUuid, groupUuids } = route.params;
  const [currentUuid, setCurrentUuid] = useState(groupUuid);
  const [localGroup, setLocalGroup] = useState<LocalDocumentGroup | undefined>(undefined);
  const [serverGroup, setServerGroup] = useState<ServerDocumentGroup | undefined>(undefined);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isMounted = useIsMounted();
  const theme = useTheme();
  const styles = createStyles(theme);
  const updaterContext = useUpdaterContext();

  const isUpdating = updaterContext.documentGroupsUpdating.some(it => it.uuid === currentUuid);

  const queryLocalGroup = useCallback((uuid: string): LocalDocumentGroup | undefined => {
    try {
      const results = Db.documents.realm().objects<LocalDocumentGroup>(DocumentGroupSchema.name).filtered("uuid = $0", uuid);
      if (results.length > 0) {
        return LocalDocumentGroup.clone(results[0], { includeChildren: true, includeParent: false });
      }
    } catch (error) {
      rollbar.error("Failed to query local document group", sanitizeErrorForRollbar(error));
    }
    return undefined;
  }, []);

  // Sync local group on uuid change & listen for Realm changes
  useEffect(() => {
    setLocalGroup(queryLocalGroup(currentUuid));

    const onCollectionChange = () => {
      if (!isMounted()) return;
      setLocalGroup(queryLocalGroup(currentUuid));
    };

    try {
      Db.documents.realm().objects(DocumentGroupSchema.name).addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to add Realm listener in DocumentGroupDetailsScreen", sanitizeErrorForRollbar(error));
    }

    return () => {
      try {
        Db.documents.realm().objects(DocumentGroupSchema.name).removeListener(onCollectionChange);
      } catch (error) {
        rollbar.error("Failed to remove Realm listener in DocumentGroupDetailsScreen", sanitizeErrorForRollbar(error));
      }
    };
  }, [currentUuid, queryLocalGroup]);

  // Fetch server data for current group (using cache first to avoid unnecessary HTTP requests)
  useEffect(() => {
    if (isUuidEmpty(currentUuid) || (localGroup && isUuidEmpty(localGroup.uuid))) {
      Alert.alert(
        "Database update required",
        "You need to update your databases, otherwise the app won't work correctly.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => navigation.goBack()
          },
          {
            text: "Update",
            onPress: () => {
              if (serverGroup) {
                handleUpdate();
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );
      return;
    }
    const cached = DocumentServer.getCachedDocumentGroup(currentUuid);
    if (cached) {
      setServerGroup(cached);
      setIsLoadingServer(false);
      return;
    }

    setServerGroup(undefined);
    setIsLoadingServer(true);
    DocumentServer.fetchDocumentGroup({ uuid: currentUuid }, { loadGroups: false, loadItems: false, loadContent: false })
      .then(data => {
        if (!isMounted()) return;
        setServerGroup(data);
      })
      .catch(error => {
        if (!isMounted()) return;
        if (!queryLocalGroup(currentUuid)) {
          if (isConnectionError(error)) {
            Alert.alert("Network error", "Could not load online document group information. Please check your internet connection.");
          } else {
            Alert.alert("Error", `Could not load document group: \n${error}`);
          }
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsLoadingServer(false);
      });
  }, [currentUuid, queryLocalGroup]);

  const activeGroup = serverGroup ?? localGroup;



  const hasUpdate = Boolean(
    serverGroup &&
    localGroup &&
    DocumentProcessor.hasUpdate([serverGroup], localGroup)
  );

  const isLocal = Boolean(localGroup);

  // Previous / Next navigation helpers
  const currentIndex = groupUuids ? groupUuids.indexOf(currentUuid) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = groupUuids !== undefined && currentIndex >= 0 && currentIndex < groupUuids.length - 1;

  const goToPrevious = () => {
    if (hasPrevious && groupUuids) {
      const prevUuid = groupUuids[currentIndex - 1];
      setCurrentUuid(prevUuid);
      setServerGroup(undefined);
    }
  };

  const goToNext = () => {
    if (hasNext && groupUuids) {
      const nextUuid = groupUuids[currentIndex + 1];
      setCurrentUuid(nextUuid);
      setServerGroup(undefined);
    }
  };

  // Actions
  const handleDownload = () => {
    if (!serverGroup || isUpdating || isProcessingAction) return;

    setIsProcessingAction(true);
    updaterContext.addDocumentGroupUpdating(serverGroup);

    DocumentUpdater.fetchAndSaveDocumentGroup(serverGroup)
      .then(() => {
        if (!isMounted()) return;
        setLocalGroup(queryLocalGroup(currentUuid));
      })
      .catch(error => {
        if (!isMounted()) return;
        if (isConnectionError(error)) {
          Alert.alert("Download failed", "Could not download documents. Please check your internet connection and try again.");
        } else {
          Alert.alert("Download failed", `Could not download documents: \n${error}`);
        }
      })
      .finally(() => {
        if (isMounted()) {
          setIsProcessingAction(false);
        }
        updaterContext.removeDocumentGroupUpdating(serverGroup);
      });
  };

  const handleUpdate = () => {
    if (!serverGroup || isUpdating || isProcessingAction) return;

    setIsProcessingAction(true);
    updaterContext.addDocumentGroupUpdating(serverGroup);

    DocumentUpdater.fetchAndUpdateDocumentGroup(serverGroup)
      .then(() => {
        if (!isMounted()) return;
        setLocalGroup(queryLocalGroup(currentUuid));
      })
      .catch(error => {
        if (!isMounted()) return;
        if (isConnectionError(error)) {
          Alert.alert("Update failed", "Could not update documents. Please check your internet connection and try again.");
        } else {
          Alert.alert("Update failed", `Could not update documents: \n${error}`);
        }
      })
      .finally(() => {
        if (isMounted()) {
          setIsProcessingAction(false);
        }
        updaterContext.removeDocumentGroupUpdating(serverGroup);
      });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (!localGroup || isProcessingAction) return;

    setIsProcessingAction(true);
    try {
      const result = DocumentProcessor.deleteDocumentGroup(localGroup);
      if (!result.success) {
        Alert.alert("Delete failed", result.message);
      } else {
        setLocalGroup(undefined);
      }
    } catch (error) {
      rollbar.error("Failed to delete document group", sanitizeErrorForRollbar(error));
      Alert.alert("Error", `Could not delete document group: \n${error}`);
    } finally {
      if (isMounted()) {
        setIsProcessingAction(false);
      }
    }
  };

  const handleShare = () => {
    if (!activeGroup) return;

    Share.share({
      message: `Download documents for ${activeGroup.name}\n\n${DeepLinking.generateLinkForDocumentGroup(activeGroup)}`
    })
      .then(result => {
        rollbar.debug("Document group shared from details screen", { shareAction: result, group: activeGroup });
      })
      .catch(error => {
        rollbar.warning("Failed to share document group from details screen", {
          ...sanitizeErrorForRollbar(error),
          group: activeGroup
        });
      });
  };

  if (!activeGroup && isLoadingServer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.default as string} />
        <SafeText style={styles.loadingText}>Loading document information...</SafeText>
      </View>
    );
  }

  if (!activeGroup) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="exclamation-circle" size={48} color={theme.colors.text.lighter as string} />
        <SafeText style={styles.loadingText}>Document group could not be found.</SafeText>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <SafeText style={styles.retryButtonText}>Go Back</SafeText>
        </TouchableOpacity>
      </View>
    );
  }

  const docCount = localGroup ? localGroup.size : (serverGroup?.size ?? 0);
  const groupYear = getDocumentGroupYear(activeGroup);
  const downloadSize = formatDocumentGroupDownloadSize(serverGroup, localGroup);
  const subGroupsCount = (localGroup?.groups?.length ?? serverGroup?.groups?.length) || 0;

  return (
    <View style={styles.container}>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        confirmationStyle={{ color: theme.colors.text.error }}
        message={`Delete all documents for ${activeGroup.name}?`}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroIconContainer}>
              <Icon name="file-alt" size={28} color={theme.colors.primary.default as string} />
            </View>
            <View style={styles.heroTitleContainer}>
              <SafeText style={styles.heroTitle}>{activeGroup.name}</SafeText>
            </View>
          </View>

          <View style={styles.statusBadgeRow}>
            {isUpdating ? (
              <View style={[styles.badge, styles.badgeUpdating]}>
                <IsDownloadingIcon />
                <SafeText style={[styles.badgeText, styles.badgeTextUpdating]}>Downloading / Updating</SafeText>
              </View>
            ) : hasUpdate ? (
              <View style={[styles.badge, styles.badgeWarning]}>
                <Icon name="arrow-circle-down" size={13} color="orange" />
                <SafeText style={[styles.badgeText, styles.badgeTextWarning]}>Update Available</SafeText>
              </View>
            ) : isLocal ? (
              <View style={[styles.badge, styles.badgeSuccess]}>
                <Icon name="check-circle" size={13} color="#0d0" />
                <SafeText style={[styles.badgeText, styles.badgeTextSuccess]}>Installed</SafeText>
              </View>
            ) : (
              <View style={[styles.badge, styles.badgeNeutral]}>
                <Icon name="cloud-download-alt" size={13} color={theme.colors.primary.default as string} />
                <SafeText style={[styles.badgeText, styles.badgeTextNeutral]}>Not Downloaded</SafeText>
              </View>
            )}
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.card}>
          <SafeText style={styles.cardHeader}>Group Details</SafeText>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="globe" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Language</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>
              {languageAbbreviationToFullName(activeGroup.language)} ({activeGroup.language.toUpperCase()})
            </SafeText>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="file-alt" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Documents</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>{docCount} documents</SafeText>
          </View>

          {downloadSize ? (
            <View style={styles.infoRow}>
              <View style={styles.infoRowLabelContainer}>
                <Icon name="database" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
                <SafeText style={styles.infoRowLabel}>{isLocal ? "Size" : "Download size"}</SafeText>
              </View>
              <SafeText style={styles.infoRowValue}>{downloadSize}</SafeText>
            </View>
          ) : null}

          {subGroupsCount > 0 ? (
            <View style={styles.infoRow}>
              <View style={styles.infoRowLabelContainer}>
                <Icon name="folder" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
                <SafeText style={styles.infoRowLabel}>Sections / Sub-groups</SafeText>
              </View>
              <SafeText style={styles.infoRowValue}>{subGroupsCount}</SafeText>
            </View>
          ) : null}

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="calendar-alt" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Year</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>{groupYear ?? "Unknown"}</SafeText>
          </View>
        </View>

        {/* License & Rights Card */}
        <View style={styles.card}>
          <SafeText style={styles.cardHeader}>License & Rights</SafeText>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="certificate" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>License Type</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>Public License</SafeText>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="copyright" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Copyright</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>Public Domain / Church Community</SafeText>
          </View>

          {/*<SafeText style={styles.licenseDescription}>*/}
          {/*  These documents are made available for personal, study, and liturgical worship use under open access permissions.*/}
          {/*</SafeText>*/}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {!isLocal && serverGroup ? (
            <TouchableOpacity
              style={[styles.primaryButton, isUpdating && styles.buttonDisabled]}
              onPress={handleDownload}
              disabled={isUpdating || isProcessingAction}
            >
              <Icon name="cloud-download-alt" size={18} color="#fff" style={styles.buttonIcon} />
              <SafeText style={styles.primaryButtonText}>
                {isUpdating ? "Downloading..." : "Download Documents"}
              </SafeText>
            </TouchableOpacity>
          ) : null}

          {hasUpdate && serverGroup ? (
            <TouchableOpacity
              style={[styles.updateButton, isUpdating && styles.buttonDisabled]}
              onPress={handleUpdate}
              disabled={isUpdating || isProcessingAction}
            >
              <Icon name="arrow-circle-down" size={18} color="#fff" style={styles.buttonIcon} />
              <SafeText style={styles.primaryButtonText}>
                {isUpdating ? "Updating..." : "Update Available"}
              </SafeText>
            </TouchableOpacity>
          ) : null}

          {isLocal ? (
            <TouchableOpacity
              style={[styles.deleteButton, isProcessingAction && styles.buttonDisabled]}
              onPress={() => setShowDeleteConfirm(true)}
              disabled={isProcessingAction || isUpdating}
            >
              <Icon name="trash-alt" size={16} color={theme.colors.text.error as string} style={styles.buttonIcon} />
              <SafeText style={styles.deleteButtonText}>Delete from Device</SafeText>
            </TouchableOpacity>
          ) : null}

          {/* Share button */}
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={isProcessingAction}
          >
            <Icon name="share-alt" size={16} color={theme.colors.primary.default as string} style={styles.buttonIcon} />
            <SafeText style={styles.shareButtonText}>Share Document Group</SafeText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Previous / Next Navigation Bar */}
      {groupUuids && groupUuids.length > 1 ? (
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={!hasPrevious}
            accessibilityLabel="Previous group"
          >
            <Icon
              name="chevron-left"
              size={14}
              color={(hasPrevious ? theme.colors.primary.default : theme.colors.text.disabled) as string}
            />
            <SafeText style={[styles.navButtonText, !hasPrevious && styles.navButtonTextDisabled]}>
              Previous
            </SafeText>
          </TouchableOpacity>

          <SafeText style={styles.navCounterText}>
            {currentIndex >= 0 ? `${currentIndex + 1} of ${groupUuids.length}` : ""}
          </SafeText>

          <TouchableOpacity
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={!hasNext}
            accessibilityLabel="Next group"
          >
            <SafeText style={[styles.navButtonText, !hasNext && styles.navButtonTextDisabled]}>
              Next
            </SafeText>
            <Icon
              name="chevron-right"
              size={14}
              color={(hasNext ? theme.colors.primary.default : theme.colors.text.disabled) as string}
            />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default DocumentGroupDetailsScreen;

const createStyles = ({ colors }: ThemeContextProps) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
      padding: 30,
    },
    loadingText: {
      color: colors.text.light,
      marginTop: 16,
      fontSize: 16,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      backgroundColor: colors.surface1,
      borderRadius: 8,
    },
    retryButtonText: {
      color: colors.primary.default,
      fontSize: 15,
      fontWeight: "600",
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    heroCard: {
      backgroundColor: colors.surface1,
      borderRadius: 14,
      padding: 20,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    heroHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    heroIconContainer: {
      width: 50,
      height: 50,
      borderRadius: 12,
      backgroundColor: colors.surface2,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    heroTitleContainer: {
      flex: 1,
    },
    heroTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.default,
      lineHeight: 26,
    },
    statusBadgeRow: {
      marginTop: 14,
      flexDirection: "row",
      alignItems: "center",
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeSuccess: {
      backgroundColor: "rgba(0, 221, 0, 0.12)",
    },
    badgeWarning: {
      backgroundColor: "rgba(255, 165, 0, 0.14)",
    },
    badgeNeutral: {
      backgroundColor: colors.surface2,
    },
    badgeUpdating: {
      backgroundColor: "rgba(30, 144, 255, 0.12)",
    },
    badgeText: {
      fontSize: 13,
      fontWeight: "600",
      marginLeft: 6,
    },
    badgeTextSuccess: {
      color: "#0a0",
    },
    badgeTextWarning: {
      color: "orange",
    },
    badgeTextNeutral: {
      color: colors.text.light,
    },
    badgeTextUpdating: {
      color: "dodgerblue",
    },
    card: {
      backgroundColor: colors.surface1,
      borderRadius: 14,
      padding: 18,
      marginBottom: 16,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    cardHeader: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.default,
      marginBottom: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.surface3,
      paddingBottom: 8,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 7,
    },
    infoRowLabelContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    infoRowIcon: {
      width: 22,
      marginRight: 6,
    },
    infoRowLabel: {
      fontSize: 14,
      color: colors.text.light,
    },
    infoRowValue: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.default,
      maxWidth: "55%",
      textAlign: "right",
    },
    licenseDescription: {
      fontSize: 13,
      color: colors.text.lighter,
      marginTop: 10,
      lineHeight: 18,
      fontStyle: "italic",
    },
    actionsCard: {
      gap: 10,
      marginBottom: 16,
    },
    primaryButton: {
      backgroundColor: colors.primary.default,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
    },
    updateButton: {
      backgroundColor: "orange",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
    },
    primaryButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    deleteButton: {
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.text.error,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      borderRadius: 12,
    },
    deleteButtonText: {
      color: colors.text.error,
      fontSize: 15,
      fontWeight: "600",
    },
    shareButton: {
      backgroundColor: colors.surface1,
      borderWidth: 1,
      borderColor: colors.surface3,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 13,
      borderRadius: 12,
    },
    shareButtonText: {
      color: colors.primary.default,
      fontSize: 15,
      fontWeight: "600",
    },
    buttonIcon: {
      marginRight: 8,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    bottomNavContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: colors.surface1,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.surface3,
      ...Platform.select({
        ios: {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 3,
        },
        android: {
          elevation: 6,
        },
      }),
    },
    navButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 8,
      backgroundColor: colors.surface2,
    },
    navButtonDisabled: {
      opacity: 0.35,
    },
    navButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary.default,
      marginHorizontal: 6,
    },
    navButtonTextDisabled: {
      color: colors.text.disabled,
    },
    navCounterText: {
      fontSize: 13,
      color: colors.text.lighter,
      fontWeight: "500",
    },
  });
