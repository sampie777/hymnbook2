import { rollbar } from "../rollbar";
import Db from "../db/db";
import { Result, sanitizeErrorForRollbar } from "../utils/utils.ts";
import { DocumentGroup } from "../db/models/documents/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../server/models/Documents";
import { DocumentGroupSchema } from "../db/models/documents/DocumentsSchema";
import { DocumentDbHelpers } from "./documentDbHelpers";

export namespace DocumentProcessor {
  export const loadLocalDocumentRoot = (): (DocumentGroup & Realm.Object<DocumentGroup>)[] => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot load local document groups: document database is not connected");
      throw new Error("Database is not connected");
    }

    return Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`isRoot = true`)
      .sorted(`name`)
      .map(it => it);  // Convert to array. Array.from() will crash tests
  };

  export const deleteDocumentGroup = (group: DocumentGroup): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot delete document group: document database is not connected", {
        group: { ...group, groups: null, items: null, _parent: null }
      });
      return new Result({ success: false, message: "Database is not connected" });
    }

    const dbGroup = Db.documents.realm().objectForPrimaryKey<DocumentGroup>(DocumentGroupSchema.name, group.id);
    if (!dbGroup) {
      rollbar.error(`Trying to delete document group which does not exist in database`, {
        group: { ...group, groups: null, items: null, _parent: null }
      });
      return new Result({ success: false, message: `Could not find document group ${group.name} in database` });
    }

    const groupName = dbGroup.name;

    try {
      Db.documents.realm().write(() => {
        DocumentDbHelpers.deleteDocumentGroup(dbGroup);
      });
    } catch (error) {
      rollbar.error("Failed to delete document group", {
        ...sanitizeErrorForRollbar(error),
        group: { ...group, groups: null, items: null, _parent: null }
      });
      throw new Error(`Could not delete (outdated) documents for ${groupName}`);
    }

    return new Result({ success: true, message: `Deleted all for ${groupName}` });
  };

  export const getAllLanguagesFromDocumentGroups = (groups: Array<ServerDocumentGroup | DocumentGroup>) => {
    if (groups.length === 0) {
      return [];
    }

    const languages: Array<string> = [];
    groups.forEach(it => {
      if (!languages.includes(it.language)) {
        languages.push(it.language);
      }
    });

    return languages;
  };

  export const determineDefaultFilterLanguage = (groups: Array<ServerDocumentGroup | DocumentGroup>) => {
    if (groups.length === 0) {
      return "";
    }

    const languageCount = {};
    groups.forEach(it => {
      // @ts-ignore
      languageCount[it.language] = (languageCount[it.language] || 0) + 1;
    });

    const languageTopList = Object.entries(languageCount)
      .sort((a: Array<any>, b: Array<any>) => b[1] - a[1]);
    return languageTopList[0][0];
  };

  export const hasUpdate = (serverGroups: ServerDocumentGroup[], group: DocumentGroup): boolean => {
    const serverGroup = serverGroups.find(it => it.uuid == group.uuid);
    if (serverGroup === undefined) {
      return false;
    }

    return serverGroup.hash != group.hash;
  };

  export const getMatchingServerGroup = (serverGroups: ServerDocumentGroup[], group: DocumentGroup): ServerDocumentGroup | undefined => {
    return serverGroups.find(it => it.uuid == group.uuid);
  };

  export const isGroupLocal = (localGroups: DocumentGroup[], group: ServerDocumentGroup) => {
    return localGroups.some(it => it.uuid == group.uuid);
  };
}
