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
import { ParamList, SongBundleDetailsRoute } from "../../../navigation";
import { SongBundle as LocalSongBundle } from "../../../logic/db/models/songs/Songs";
import { SongBundle as ServerSongBundle } from "../../../logic/server/models/ServerSongsModel";
import { ThemeContextProps, useTheme } from "../../components/providers/ThemeProvider";
import { useUpdaterContext } from "../../components/providers/UpdaterContextProvider";
import { SongProcessor } from "../../../logic/songs/songProcessor";
import { SongUpdater } from "../../../logic/songs/updater/songUpdater";
import { Server } from "../../../logic/server/server";
import { rollbar } from "../../../logic/rollbar";
import { DeepLinking } from "../../../logic/deeplinking";
import { languageAbbreviationToFullName, sanitizeErrorForRollbar } from "../../../logic/utils/utils.ts";
import { isConnectionError } from "../../../logic/apiUtils";
import Db from "../../../logic/db/db";
import { SongBundleSchema } from "../../../logic/db/models/songs/SongsSchema";
import SafeText from "../../components/SafeText.tsx";
import ConfirmationModal from "../../components/popups/ConfirmationModal";
import Icon from "react-native-vector-icons/FontAwesome5";
import { IsDownloadingIcon } from "./common";
import { useIsMounted } from "../../components/utils";
import { formatSongBundleDownloadSize } from "./downloadSize";

interface Props extends NativeStackScreenProps<ParamList, typeof SongBundleDetailsRoute> {}

export const getBundleYear = (bundle?: { name?: string; copyright?: string; createdAt?: string | Date }): string | undefined => {
  if (!bundle) return undefined;
  const nameYear = bundle.name?.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  if (nameYear) return nameYear[0];
  const copyrightYear = bundle.copyright?.match(/\b(1[6-9]\d{2}|20\d{2})\b/);
  if (copyrightYear) return copyrightYear[0];
  if (bundle.createdAt) {
    const date = new Date(bundle.createdAt);
    if (!isNaN(date.getFullYear())) {
      return date.getFullYear().toString();
    }
  }
  return undefined;
};

const SongBundleDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bundleUuid, bundleUuids } = route.params;
  const [currentUuid, setCurrentUuid] = useState(bundleUuid);
  const [localBundle, setLocalBundle] = useState<LocalSongBundle | undefined>(undefined);
  const [serverBundle, setServerBundle] = useState<ServerSongBundle | undefined>(undefined);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const isMounted = useIsMounted();
  const theme = useTheme();
  const styles = createStyles(theme);
  const updaterContext = useUpdaterContext();

  const updatingItem = updaterContext.songBundlesUpdating.find(it => it.uuid === currentUuid);
  const isUpdating = Boolean(updatingItem);
  const progress = updatingItem?.progress ?? 0;

  const queryLocalBundle = useCallback((uuid: string): LocalSongBundle | undefined => {
    try {
      const results = Db.songs.realm().objects<LocalSongBundle>(SongBundleSchema.name).filtered("uuid = $0", uuid);
      if (results.length > 0) {
        return LocalSongBundle.clone(results[0], { includeSongs: true, includeVerses: false });
      }
    } catch (error) {
      rollbar.error("Failed to query local song bundle", sanitizeErrorForRollbar(error));
    }
    return undefined;
  }, []);

  // Sync local bundle on uuid change & listen for Realm changes
  useEffect(() => {
    setLocalBundle(queryLocalBundle(currentUuid));

    const onCollectionChange = () => {
      if (!isMounted()) return;
      setLocalBundle(queryLocalBundle(currentUuid));
    };

    try {
      Db.songs.realm().objects(SongBundleSchema.name).addListener(onCollectionChange);
    } catch (error) {
      rollbar.error("Failed to add Realm listener in SongBundleDetailsScreen", sanitizeErrorForRollbar(error));
    }

    return () => {
      try {
        Db.songs.realm().objects(SongBundleSchema.name).removeListener(onCollectionChange);
      } catch (error) {
        rollbar.error("Failed to remove Realm listener in SongBundleDetailsScreen", sanitizeErrorForRollbar(error));
      }
    };
  }, [currentUuid, queryLocalBundle]);

  // Fetch server data for current bundle (using cache first to avoid unnecessary HTTP requests)
  useEffect(() => {
    if (isUuidEmpty(currentUuid) || (localBundle && isUuidEmpty(localBundle.uuid))) {
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
              if (serverBundle) {
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
    const cached = Server.getCachedSongBundle(currentUuid);
    if (cached) {
      setServerBundle(cached);
      setIsLoadingServer(false);
      return;
    }

    setIsLoadingServer(true);
    Server.fetchSongBundle({ uuid: currentUuid }, { loadSongs: false, loadVerses: false, loadAbcMelodies: false })
      .then(data => {
        if (!isMounted()) return;
        setServerBundle(data);
      })
      .catch(error => {
        if (!isMounted()) return;
        // Don't alert if local exists, since user might be offline
        if (!queryLocalBundle(currentUuid)) {
          if (isConnectionError(error)) {
            Alert.alert("Network error", "Could not load online bundle information. Please check your internet connection.");
          } else {
            Alert.alert("Error", `Could not load song bundle: 
${error}`);
          }
        }
      })
      .finally(() => {
        if (!isMounted()) return;
        setIsLoadingServer(false);
      });
  }, [currentUuid, queryLocalBundle]);

  const activeBundle = serverBundle ?? localBundle;



  const hasUpdate = Boolean(
    serverBundle &&
    localBundle &&
    SongProcessor.hasUpdate([serverBundle], localBundle)
  );

  const isLocal = Boolean(localBundle);

  // Previous / Next navigation helpers
  const currentIndex = bundleUuids ? bundleUuids.indexOf(currentUuid) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = bundleUuids !== undefined && currentIndex >= 0 && currentIndex < bundleUuids.length - 1;

  const goToPrevious = () => {
    if (hasPrevious && bundleUuids) {
      const prevUuid = bundleUuids[currentIndex - 1];
      setCurrentUuid(prevUuid);
      setServerBundle(undefined);
    }
  };

  const goToNext = () => {
    if (hasNext && bundleUuids) {
      const nextUuid = bundleUuids[currentIndex + 1];
      setCurrentUuid(nextUuid);
      setServerBundle(undefined);
    }
  };

  // Actions
  const handleDownload = () => {
    if (!serverBundle || isUpdating || isProcessingAction) return;

    setIsProcessingAction(true);
    updaterContext.addSongBundleUpdating({ uuid: serverBundle.uuid, progress: 0 });

    SongUpdater.fetchAndSaveSongBundle(serverBundle, (prog) => {
      updaterContext.updateSongBundleProgress(serverBundle.uuid, prog.percent);
    })
      .then(() => {
        if (!isMounted()) return;
        setLocalBundle(queryLocalBundle(currentUuid));
      })
      .catch(error => {
        if (!isMounted()) return;
        if (isConnectionError(error)) {
          Alert.alert("Download failed", "Could not download songs. Please check your internet connection and try again.");
        } else {
          Alert.alert("Download failed", `Could not download song bundle: 
${error}`);
        }
      })
      .finally(() => {
        if (isMounted()) {
          setIsProcessingAction(false);
        }
        updaterContext.removeSongBundleUpdating(serverBundle);
      });
  };

  const handleUpdate = () => {
    if (!serverBundle || isUpdating || isProcessingAction) return;

    setIsProcessingAction(true);
    updaterContext.addSongBundleUpdating({ uuid: serverBundle.uuid, progress: 0 });

    SongUpdater.fetchAndUpdateSongBundle(serverBundle, (prog) => {
      updaterContext.updateSongBundleProgress(serverBundle.uuid, prog.percent);
    })
      .then(() => {
        if (!isMounted()) return;
        setLocalBundle(queryLocalBundle(currentUuid));
      })
      .catch(error => {
        if (!isMounted()) return;
        if (isConnectionError(error)) {
          Alert.alert("Update failed", "Could not update songs. Please check your internet connection and try again.");
        } else {
          Alert.alert("Update failed", `Could not update song bundle: 
${error}`);
        }
      })
      .finally(() => {
        if (isMounted()) {
          setIsProcessingAction(false);
        }
        updaterContext.removeSongBundleUpdating(serverBundle);
      });
  };

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    if (!localBundle || isProcessingAction) return;

    setIsProcessingAction(true);
    try {
      SongProcessor.deleteSongBundle(localBundle);
      setLocalBundle(undefined);
    } catch (error) {
      rollbar.error("Failed to delete song bundle", sanitizeErrorForRollbar(error));
      Alert.alert("Error", `Could not delete song bundle: 
${error}`);
    } finally {
      if (isMounted()) {
        setIsProcessingAction(false);
      }
    }
  };

  const handleShare = () => {
    if (!activeBundle) return;

    Share.share({
      message: `Download song bundle for ${activeBundle.name}

${DeepLinking.generateLinkForSongBundle(activeBundle)}`
    })
      .then(result => {
        rollbar.debug("Song bundle shared from details screen", { shareAction: result, bundle: activeBundle });
      })
      .catch(error => {
        rollbar.warning("Failed to share song bundle from details screen", {
          ...sanitizeErrorForRollbar(error),
          bundle: activeBundle
        });
      });
  };

  if (!activeBundle && isLoadingServer) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary.default as string} />
        <SafeText style={styles.loadingText}>Loading song bundle information...</SafeText>
      </View>
    );
  }

  if (!activeBundle) {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="exclamation-circle" size={48} color={theme.colors.text.lighter as string} />
        <SafeText style={styles.loadingText}>Song bundle could not be found.</SafeText>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <SafeText style={styles.retryButtonText}>Go Back</SafeText>
        </TouchableOpacity>
      </View>
    );
  }

  const songCount = localBundle ? localBundle.songs.length : (serverBundle?.size ?? serverBundle?.songs?.length ?? 0);
  const bundleYear = getBundleYear(activeBundle);
  const downloadSize = formatSongBundleDownloadSize(serverBundle, localBundle);
  const bundleCopyright = (activeBundle?.copyright?.trim())
    || (localBundle?.copyright?.trim())
    || (serverBundle?.copyright?.trim())
    || "Public Domain / Church Community";

  return (
    <View style={styles.container}>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        confirmationStyle={{ color: theme.colors.text.error }}
        message={`Delete all songs for ${activeBundle.name}?`}
      />

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
        {/* Header Hero Section */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroIconContainer}>
              <Icon name="book" size={28} color={theme.colors.primary.default as string} />
            </View>
            <View style={styles.heroTitleContainer}>
              <SafeText style={styles.heroTitle}>{activeBundle.name}</SafeText>
              {activeBundle.abbreviation ? (
                <SafeText style={styles.heroAbbreviation}>({activeBundle.abbreviation})</SafeText>
              ) : null}
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
          <SafeText style={styles.cardHeader}>Bundle Details</SafeText>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="globe" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Language</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>
              {languageAbbreviationToFullName(activeBundle.language)} ({activeBundle.language.toUpperCase()})
            </SafeText>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="music" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Songs</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>{songCount} songs</SafeText>
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

          <View style={styles.infoRow}>
            <View style={styles.infoRowLabelContainer}>
              <Icon name="calendar-alt" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
              <SafeText style={styles.infoRowLabel}>Year</SafeText>
            </View>
            <SafeText style={styles.infoRowValue}>{bundleYear ?? "Unknown"}</SafeText>
          </View>

          {activeBundle.author ? (
            <View style={styles.infoRow}>
              <View style={styles.infoRowLabelContainer}>
                <Icon name="feather-alt" size={15} color={theme.colors.text.lighter as string} style={styles.infoRowIcon} />
                <SafeText style={styles.infoRowLabel}>Author / Publisher</SafeText>
              </View>
              <SafeText style={styles.infoRowValue}>{activeBundle.author}</SafeText>
            </View>
          ) : null}
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
            <SafeText style={styles.infoRowValue}>{bundleCopyright}</SafeText>
          </View>

          <SafeText style={styles.licenseDescription}>
            This song bundle is provided for personal, church, and community worship use under open access permissions.
          </SafeText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCard}>
          {isUpdating ? (
            <View style={styles.progressContainer}>
              <View style={styles.progressBarTrack}>
                <View style={[styles.progressBarIndicator, { width: `${Math.max(2, Math.round(progress * 100))}%` }]} />
              </View>
            </View>
          ) : null}

          {!isLocal && serverBundle ? (
            <TouchableOpacity
              style={[styles.primaryButton, isUpdating && styles.buttonDisabled]}
              onPress={handleDownload}
              disabled={isUpdating || isProcessingAction}
            >
              <Icon name="cloud-download-alt" size={18} color="#fff" style={styles.buttonIcon} />
              <SafeText style={styles.primaryButtonText}>
                {isUpdating ? "Downloading..." : "Download Bundle"}
              </SafeText>
            </TouchableOpacity>
          ) : null}

          {hasUpdate && serverBundle ? (
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
            <SafeText style={styles.shareButtonText}>Share Song Bundle</SafeText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Previous / Next Navigation Bar */}
      {bundleUuids && bundleUuids.length > 1 ? (
        <View style={styles.bottomNavContainer}>
          <TouchableOpacity
            style={[styles.navButton, !hasPrevious && styles.navButtonDisabled]}
            onPress={goToPrevious}
            disabled={!hasPrevious}
            accessibilityLabel="Previous bundle"
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
            {currentIndex >= 0 ? `${currentIndex + 1} of ${bundleUuids.length}` : ""}
          </SafeText>

          <TouchableOpacity
            style={[styles.navButton, !hasNext && styles.navButtonDisabled]}
            onPress={goToNext}
            disabled={!hasNext}
            accessibilityLabel="Next bundle"
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

export default SongBundleDetailsScreen;

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
    heroAbbreviation: {
      fontSize: 14,
      color: colors.text.light,
      marginTop: 2,
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
    progressContainer: {
      marginBottom: 14,
      width: "100%",
    },
    progressBarTrack: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.surface3,
      overflow: "hidden",
    },
    progressBarIndicator: {
      height: "100%",
      borderRadius: 3,
      backgroundColor: colors.primary.default,
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
