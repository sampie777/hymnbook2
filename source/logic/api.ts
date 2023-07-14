import { ServerAuth } from "./server/auth";
import { databaseHost, hymnbookHost } from "../../app.json";

const databaseApiEndpoint = `${databaseHost}/api/v1`;
const hymnbookApiEndpoint = `${hymnbookHost}/api/v1`;

const get = (url: string) =>
  ServerAuth.fetchWithJwt(jwt =>
    fetch(url, {
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
    get: (id: number,
          loadSongs = false,
          loadVerses = false,
          loadAbcMelodies = true) =>
      get(`${databaseApiEndpoint}/songs/bundles/${id}?loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`),
    getWithSongs: (id: number,
                   loadVerses = true,
                   loadAbcMelodies = true) =>
      api.songBundles.get(id, true, loadVerses, loadAbcMelodies)
  },

  documents: {
    groups: {
      root: (loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean, page = 0, page_size = 50) =>
        get(`${databaseApiEndpoint}/documents/groups/root?loadGroups=${loadGroups ? "true" : "false"}` +
          `&loadItems=${loadItems ? "true" : "false"}` +
          `&loadContent=${loadContent ? "true" : "false"}` +
          `&page=${page}&page_size=${page_size}`),
      get: (id: number, loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean) =>
        get(`${databaseApiEndpoint}/documents/groups/${id}?loadGroups=${loadGroups ? "true" : "false"}` +
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
