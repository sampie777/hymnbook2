import {describe, it} from '@jest/globals';
import Db from "../source/logic/db/db";

// Mock test to let the test run
describe("", () => {
  it("", () => {})
})

/* Include the following two lines in the test file outside the `describe()` method:

jest.mock("hymnbook2/source/logic/db/db");
mockDb();

 */
export const mockDb = () => {
  Db.songs.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.songs.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });
  Db.documents.getIncrementedPrimaryKey.mockImplementation(() => 1);
  Db.documents.realm.mockImplementation(() => {
    return {
      objects: () => [],
      write: (callback) => callback ? callback() : undefined,
      create: () => undefined,
      delete: () => undefined,
    };
  });
};