import { DatabaseProvider } from "../dbProvider";


export const removeObjectsWithoutParents = (
  db: DatabaseProvider,
  schemas: {
    schemaName: string,
    parentLink: string,
    extraQuery?: string,
  }[],
) => {
  // Just so the compiler doesn't throw it all away, for debugging purposes.
  console.log(db._isConnected, schemas.length);
  // schemas.forEach(schema => {
  //   const data = db.realm().objects(schema.schemaName)
  //     .filtered(`${schema.parentLink}.@count = 0 ${schema.extraQuery ? schema.extraQuery : ""}`);
  //
  //   if (data.length == 0) return;
  //
  //   try {
  //     db.realm().write(() => {
  //       db.realm().delete(data);
  //     });
  //   } catch (error) {
  //     rollbar.error(`Failed to delete unused ${schema.schemaName}`, {
  //       ...sanitizeErrorForRollbar(error),
  //       dataLength: data.length
  //     });
  //   }
  // })
}