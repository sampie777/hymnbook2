import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils";
import { DatabaseProvider } from "../dbProvider";


export const removeObjectsWithoutParents = (
  db: DatabaseProvider,
  schemas: {
    schemaName: string,
    parentLink: string,
    extraQuery?: string,
  }[],
) => {
  schemas.forEach(schema => {
    const data = db.realm().objects(schema.schemaName)
      .filtered(`${schema.parentLink}.@count = 0 ${schema.extraQuery ? schema.extraQuery : ""}`);

    if (data.length == 0) return;

    try {
      db.realm().write(() => {
        db.realm().delete(data);
      });
    } catch (error) {
      rollbar.error(`Failed to delete unused ${schema.schemaName}`, {
        ...sanitizeErrorForRollbar(error),
        dataLength: data.length
      });
    }
  })
}