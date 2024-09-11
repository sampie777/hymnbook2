import { DatabaseProvider } from "../dbProvider";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";


export const removeObjectsWithoutParents = (
  db: DatabaseProvider,
  schemas: {
    schemaName: string,
    parentLink: string,
    extraQuery?: string,
  }[],
) => {
  // Just so the compiler doesn't throw it all away, for debugging purposes.
  rollbar.debug("removeObjectsWithoutParents 0.0", {
    dbIsConnected: db._isConnected,
    schemasLength: schemas.length,
    realmIsClosed: db.realm().isClosed,
    realmIsInMigration: db.realm().isInMigration,
    realmIsInTransaction: db.realm().isInTransaction,
  });
  schemas.forEach(schema => {
    const data = db.realm().objects(schema.schemaName)
    // .filtered(`${schema.parentLink}.@count = 0 ${schema.extraQuery ? schema.extraQuery : ""}`);
    rollbar.debug("removeObjectsWithoutParents 0.1", {
      dataLength: data.length,
      isConnected: db._isConnected,
      schemasLength: schemas.length,
      realmIsClosed: db.realm().isClosed,
      realmIsInMigration: db.realm().isInMigration,
      realmIsInTransaction: db.realm().isInTransaction,
    });
    // if (data.length == 0) return;
    //
    // try {
    //   db.realm().write(() => {
    //     db.realm().delete(data);
    //   });
    // } catch (error) {
    //   rollbar.error(`Failed to delete unused ${schema.schemaName}`, {
    //     ...sanitizeErrorForRollbar(error),
    //     dataLength: data.length
    //   });
    // }
  })
}