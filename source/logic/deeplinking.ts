import { EmitterSubscription, Linking } from "react-native";
import { rollbar } from "./rollbar";
import config from "../config";

export namespace DeepLinking {
  export interface Route {
    scheme: string;
    host?: string;
    path: string;
  }

  export type Callback<T> = (route: Route, args: T) => void;

  const callbacks = new Map<string, Callback<any>>();
  let linkingEventListener: EmitterSubscription | undefined = undefined;

  export const setup = () => {
    Linking.getInitialURL().then(handle);
    linkingEventListener?.remove();
    linkingEventListener = Linking.addEventListener("url", ({ url }) => handle(url));
  };

  export const teardown = () => {
    linkingEventListener?.remove();
    linkingEventListener = undefined;
  };

  export const registerRoute = <T = {}>(path: string, callback: Callback<T>) => {
    callbacks.set(path, callback);
  };

  export const validateUrl = (url: string): boolean =>
    config.deepLinkPaths.some(path => url.startsWith(path));

  export const parseUrl = (url: string): Route | null => {
    const schemeRegex = /^(.*?):\/\//;
    const trailingSlashesRegex = /(^\/+|\/+$)*/g;

    const schemeMatch = url.match(schemeRegex);
    if (schemeMatch === null || schemeMatch.length < 2) {
      rollbar.error("Could not parse invalid scheme for deep linking", {
        url: url
      });
      return null;
    }

    const scheme = schemeMatch[1];
    const path = url
      // Remove scheme and possible host (if scheme is http(s))
      .replace(/^(https?:\/\/.*?(\/|$)|(?!http).*?:\/\/)/i, "")
      .replace(trailingSlashesRegex, "");
    const host = url.replace(path, "")
      .replace(schemeRegex, "")
      .replace(trailingSlashesRegex, "");

    return {
      scheme: scheme,
      host: scheme === "http" || scheme === "https" ? host : undefined,
      path: "/" + path
    };
  };

  export const findCallback = (path: string): { path: string, callback: Callback<{}> } | null => {
    const exactMatch = callbacks.get(path);
    if (exactMatch) return { path: path, callback: exactMatch };

    const matchPath = Array.from(callbacks.keys()).find(key => {
      const regex = "^" + key.replace(/\/:[^/]*/gi, "/.*?") + "$";
      return path.match(new RegExp(regex));
    });
    if (matchPath && callbacks.has(matchPath)) return { path: matchPath, callback: callbacks.get(matchPath)! };

    return null;
  };

  export const populateRouteWithPathVariables = (templatePath: string, path: string): object => {
    const result = new Map<string, string>();
    const pathSegments = path.split("/");
    templatePath.split("/")
      .forEach((key, index) => {
        if (!key.startsWith(":")) return;
        result.set(key.replace(/^:/, ""), pathSegments[index]);
      });
    return Object.fromEntries(result);
  };

  export const handle = (url: string | null, validate = true) => {
    if (url === null) return;

    if (validate && !validateUrl(url)) {
      // Ignore track player notification clicks
      if (url.startsWith("trackplayer://")) return;

      rollbar.warning("Received invalid deep link", {
        url: url,
        deepLinkPaths: config.deepLinkPaths
      });
      return;
    }

    const route = parseUrl(url);
    if (route == null) return;

    const callback = findCallback(route.path);
    if (callback == null) return;

    const pathVariables = populateRouteWithPathVariables(callback.path, route.path);
    rollbar.debug("Handling deep link", {
      route: route,
      pathVariables: pathVariables,
      matchingPath: callback.path
    });

    try {
      callback.callback(route, pathVariables);
    } catch (e) {
      rollbar.error("Deep link callback threw exception", {
        error: e,
        route: route,
        pathVariables: pathVariables,
        matchingPath: callback.path
      });
    }
  };

  export const generateLinkForSongBundle = (bundle: { uuid: string, name: string }): string => {
    return `https://hymnbook.sajansen.nl/open/downloads/songs/${bundle.uuid}/${encodeURIComponent(bundle.name)}`;
  };

  export const generateLinkForDocumentGroup = (group: { uuid: string, name: string }): string => {
    return `https://hymnbook.sajansen.nl/open/downloads/documents/${group.uuid}/${encodeURIComponent(group.name)}`;
  };
}
