import { ServerAuth } from "./server/auth";
import { songBundlesApiUrl } from "../../app.json";

const apiHostUrl = songBundlesApiUrl;
const apiBaseUrl = `${apiHostUrl}/api/v1`;

const get = (url: string) =>
  ServerAuth.withJwt(jwt =>
    fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Authorization": `Bearer ${jwt}`
      }
    })
  );

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const post = (url: string, data: any = "", authenticate: boolean = true) => {
  if (authenticate) {
    return ServerAuth.withJwt(jwt => {
      return fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${jwt}`
        },
        // mode: 'no-cors',
        body: JSON.stringify(data)
      });
    });
  } else {
    return fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      // mode: 'no-cors',
      body: JSON.stringify(data)
    });
  }
};

const put = (url: string, data: any = "") => ServerAuth.withJwt(jwt =>
  fetch(url, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`
    },
    body: JSON.stringify(data)
  }));

const remove = (url: string, data: any = "") => ServerAuth.withJwt(jwt =>
  fetch(url, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${jwt}`
    },
    body: JSON.stringify(data)
  }));

const upload = (url: string, data: FormData) => ServerAuth.withJwt(jwt =>
  fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${jwt}`
      // 'Content-Type': 'multipart/form-data'
    },
    // mode: 'no-cors',
    body: data
  }));

export const api = {
  songBundles: {
    list: (loadSongs = false,
           loadVerses = false,
           loadAbcMelodies = false) =>
      get(`${apiBaseUrl}/songs/bundles?loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`),
    get: (id: number,
          loadSongs = false,
          loadVerses = false,
          loadAbcMelodies = true) =>
      get(`${apiBaseUrl}/songs/bundles/${id}?loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`),
    getWithSongs: (id: number,
                   loadVerses = true,
                   loadAbcMelodies = true) =>
      api.songBundles.get(id, true, loadVerses, loadAbcMelodies),
    search: (query: string,
             page = 0,
             page_size = 50,
             fieldLanguages: Array<string> = [],
             loadSongs = false,
             loadVerses = false,
             loadAbcMelodies = false) =>
      get(`${apiBaseUrl}/songs/bundles?query=${query}&page=${page}&page_size=${page_size}` +
        `&fieldLanguages=${fieldLanguages.join(",")}` +
        `&loadSongs=${loadSongs ? "true" : "false"}` +
        `&loadVerses=${loadVerses ? "true" : "false"}` +
        `&loadAbcMelodies=${loadAbcMelodies ? "true" : "false"}`)
  },

  documents: {
    groups: {
      root: (loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean, page = 0, page_size = 50) =>
        get(`${apiBaseUrl}/documents/groups/root?loadGroups=${loadGroups ? "true" : "false"}` +
          `&loadItems=${loadItems ? "true" : "false"}` +
          `&loadContent=${loadContent ? "true" : "false"}` +
          `&page=${page}&page_size=${page_size}`),
      get: (id: number, loadGroups?: boolean, loadItems?: boolean, loadContent?: boolean) =>
        get(`${apiBaseUrl}/documents/groups/${id}?loadGroups=${loadGroups ? "true" : "false"}` +
          `&loadItems=${loadItems ? "true" : "false"}` +
          `&loadContent=${loadContent ? "true" : "false"}`)
    }
  }
};
