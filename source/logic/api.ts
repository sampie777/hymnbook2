import { ServerAuth } from "./server/auth";
import { databaseHost, hymnbookHost } from "../../app.json";
import { Song, SongAudio } from "./db/models/songs/Songs";
import { BackendError, HttpError } from "./apiUtils";
import { SongBundle as ServerSongBundle } from "./server/models/ServerSongsModel";
import Settings from "../settings";
import fetchBuilder from "fetch-retry";
import config from "../config";

export const fetchRetry = fetchBuilder(fetch, { retries: config.fetchRetries });

export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number;
}

export const databaseApiEndpoint = `${databaseHost}/api/v1`;
export const hymnbookApiEndpoint = `${hymnbookHost}/api/v1`;

export const isLocalhostServer = (url: string = databaseHost): boolean => {
  if (!url) return false;
  try {
    const clean = url.trim().toLowerCase();
    return (
      clean.includes("localhost") ||
      clean.includes("127.0.0.1") ||
      clean.includes("10.0.2.2") ||
      clean.includes("0.0.0.0") ||
      clean.includes("[::1]") ||
      /(https?:\/\/)?(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+|.*\.local)(:\d+)?/i.test(clean)
    );
  } catch {
    return false;
  }
};

const get = (url: string) =>
  ServerAuth.fetchWithJwt(jwt =>
    fetchRetry(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${jwt}`
      }
    })
  );

export const api = {
  songBundles: {
    list: (loadSongs = false,
           loadVerses = false,
           loadAbcMelodies = false) =>
      get(`${databaseApiEndpoint}/songs/bundles?loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`),
    get: (uuid: string,
          loadSongs = false,
          loadVerses = false,
          loadAbcMelodies = true) =>
      get(`${databaseApiEndpoint}/songs/bundles/${uuid}?loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`),
    updates: () => get(`${databaseApiEndpoint}/songs/bundles/updates`),
    download: (
      idOrUuid: string | number,
      onProgress?: (progress: DownloadProgress) => void
    ): Promise<ServerSongBundle> => {
      const startRequest = (retryAuth = true): Promise<ServerSongBundle> => {
        return new Promise<ServerSongBundle>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          const url = `${databaseApiEndpoint}/songs/bundles/${idOrUuid}/download`;

          xhr.open("GET", url, true);
          xhr.setRequestHeader("Accept", "application/json");
          const jwt = ServerAuth.getJwt();
          if (jwt) {
            xhr.setRequestHeader("Authorization", `Bearer ${jwt}`);
          }

          xhr.onprogress = (event) => {
            if (event.lengthComputable && event.total > 0) {
              const percent = Math.min(1, Math.max(0, event.loaded / event.total));
              onProgress?.({
                loaded: event.loaded,
                total: event.total,
                percent,
              });
            } else if (event.loaded > 0) {
              onProgress?.({
                loaded: event.loaded,
                total: event.total || event.loaded,
                percent: 0,
              });
            }
          };

          xhr.onload = () => {
            if (xhr.status === 401 || xhr.status === 403) {
              if (retryAuth) {
                ServerAuth.authenticate()
                  .then(() => resolve(startRequest(false)))
                  .catch(reject);
                return;
              }
            }

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                if (response && response.type === "SUCCESS" && response.content) {
                  resolve(response.content as ServerSongBundle);
                } else if (response && response.type === "ERROR") {
                  reject(new BackendError(response.content || "Download error"));
                } else {
                  resolve((response.content ?? response) as ServerSongBundle);
                }
              } catch (e) {
                reject(new Error(`Failed to parse download response: ${e}`));
              }
            } else {
              reject(new HttpError(`Download failed with status ${xhr.status}: ${xhr.statusText || xhr.responseText}`));
            }
          };

          xhr.onerror = () => {
            reject(new TypeError("Network request failed"));
          };

          xhr.ontimeout = () => {
            reject(new TypeError("Network request failed"));
          };

          xhr.send();
        });
      };

      return startRequest(true);
    },
  },

  songs: {
    audio: {
      all: (song: Song) => get(`${databaseApiEndpoint}/songs/${song.uuid}/audio`),
      single: (item: SongAudio) => `${databaseApiEndpoint}/songs/audio/${item.uuid}` +
        `?dontDownload=${!Settings.trackDownloads}`
    }
  },

  documents: {
    groups: {
      root: (loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean, page = 0, page_size = 50) =>
        get(`${databaseApiEndpoint}/documents/groups/root?loadGroups=${loadGroups ? "true" : "false"}` +
          `&loadItems=${loadItems ? "true" : "false"}` +
          `&loadContent=${loadContent ? "true" : "false"}` +
          `&page=${page}&page_size=${page_size}`),
      get: (uuid: string, loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean) =>
        get(`${databaseApiEndpoint}/documents/groups/${uuid}?loadGroups=${loadGroups ? "true" : "false"}` +
          `&loadItems=${loadItems ? "true" : "false"}` +
          `&loadContent=${loadContent ? "true" : "false"}`),
      updates: () => get(`${databaseApiEndpoint}/documents/groups/updates`),
    }
  },

  features: (appVersion: string, buildNumber: number, clientId: string, os: string, appOpenedTimes: number) =>
    get(`${hymnbookApiEndpoint}/features?app_version=${appVersion}` +
      `&build_number=${buildNumber}` +
      `&client_id=${clientId}` +
      `&os=${os}` +
      `&app_opened_times=${appOpenedTimes}`),

  donations: {
    stripe: {
      paymentSheet: (amount: number,
                     currency: string,
                     clientId: string,
                     capturePayment: boolean = true,
                     testMode: boolean = false) =>
        fetch(`${hymnbookApiEndpoint}/stripe/payment-sheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', },
          body: JSON.stringify({
            amount: amount,
            currency: currency,
            client: clientId,
            capture: capturePayment,
            testMode: testMode,
          })
        })
    },
    paypal: "https://www.paypal.com/donate/?hosted_button_id=6KTU5JNVS699E",
    buyMeACoffee: "https://www.buymeacoffee.com/sajansen"
  }
};
