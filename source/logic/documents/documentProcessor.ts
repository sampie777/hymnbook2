import { rollbar } from "../rollbar";
import Db from "../db/db";
import { Result } from "../utils";
import { DocumentGroup } from "../db/models/Documents";
import { DocumentGroup as ServerDocumentGroup } from "../server/models/Documents";
import { DocumentGroupSchema } from "../db/models/DocumentsSchema";

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
      rollbar.warning("Cannot delete document group: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const deleteGroup = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name).find(it => it.id === group.id);
    if (deleteGroup === null || deleteGroup === undefined) {
      rollbar.error(`Trying to delete document group which does not exist in database`, {
        group: group
      });
      return new Result({ success: false, message: `Cannot find document group ${group.name} in database` });
    }

    const groupName = deleteGroup.name;

    // Shallow copy
    const deleteGroups = deleteGroup.groups?.slice(0) || [];
    deleteGroups.forEach(it => {
      deleteDocumentGroup(it);
    });

    Db.documents.realm().write(() => {
      Db.documents.realm().delete(deleteGroup.items);
      Db.documents.realm().delete(deleteGroup);
    });

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
