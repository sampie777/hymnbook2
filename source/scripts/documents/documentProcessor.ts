import { Result } from "../utils";
import Db from "../db/db";
import { DocumentGroup } from "../../models/Documents";
import { DocumentGroupSchema } from "../../models/DocumentsSchema";
import { rollbar } from "../rollbar";

export namespace DocumentProcessor {
  export const loadLocalDocumentGroups = (): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot load local document groups: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const groups = Db.documents.realm()
      .objects<DocumentGroup>(DocumentGroupSchema.name)
      .map(it => it as unknown as DocumentGroup);

    return new Result({ success: true, data: groups });
  };

  export const deleteDocumentDatabase = (): Promise<Result> => {
    Db.documents.deleteDb();

    return Db.documents.connect()
      .then(_ => new Result({ success: true, message: "Deleted all documents" }))
      .catch(e => {
        rollbar.error("Could not connect to local document database after deletions: " + e?.toString(), e);
        return new Result({ success: false, message: "Could not reconnect to local database after deletions: " + e });
      });
  };

  export const deleteDocumentGroup = (group: DocumentGroup): Result => {
    if (!Db.documents.isConnected()) {
      rollbar.warning("Cannot delete document group: document database is not connected");
      return new Result({ success: false, message: "Database is not connected" });
    }

    const deleteGroup = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name).find(it => it.id === group.id)
    if (deleteGroup === null || deleteGroup === undefined) {
      rollbar.error(`Trying to delete document group which does not exist in database: ${group}`)
      return new Result({ success: false, message: `Cannot find document group ${group.name} in database` });
    }

    const groupName = deleteGroup.name;

    // Shallow copy
    const deleteGroups = deleteGroup.groups?.slice(0) || [];
    deleteGroups.forEach(it => {
      deleteDocumentGroup(it);
    })

    Db.documents.realm().write(() => {
      Db.documents.realm().delete(deleteGroup.items);
      Db.documents.realm().delete(deleteGroup);
    });

    return new Result({ success: true, message: `Deleted all for ${groupName}` });
  };
}
