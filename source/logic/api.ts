import { ServerAuth } from "./server/auth";
import { databaseHost, hymnbookHost } from "../../app.json";
import { Song, SongAudio } from "./db/models/Songs";
import Settings from "../settings";
import fetchBuilder from "fetch-retry";
import config from "../config";

export const fetchRetry = fetchBuilder(fetch, {retries: config.fetchRetries});

const databaseApiEndpoint = `${databaseHost}/api/v1`;
const hymnbookApiEndpoint = `${hymnbookHost}/api/v1`;

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
    getWithSongs: (uuid: string,
                   loadVerses = true,
                   loadAbcMelodies = true) =>
      api.songBundles.get(uuid, true, loadVerses, loadAbcMelodies)
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
          `&loadContent=${loadContent ? "true" : "false"}`)
    }
  },

  features: (appVersion: string, buildNumber: number, clientId: string, os: string, appOpenedTimes: number) =>
    get(`${hymnbookApiEndpoint}/features?app_version=${appVersion}` +
      `&build_number=${buildNumber}` +
      `&client_id=${clientId}` +
      `&os=${os}` +
      `&app_opened_times=${appOpenedTimes}`)
};
