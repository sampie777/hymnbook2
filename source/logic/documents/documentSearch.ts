import Settings from "../../settings";
import { DocumentGroup, Document } from "../db/models/Documents";

export namespace DocumentSearch {
  export const searchForGroups = (groups: Array<DocumentGroup> | null,
                                  searchText: string): Array<DocumentGroup> => {
    if (groups == null)
      return [];

    searchText = searchText.toLowerCase();
    const searchWords = searchText.split(" ");

    const searchNameFunc = (group: DocumentGroup) => {
      if (Settings.documentsMultiKeywordSearch) {
        return searchWords.every(it => (new RegExp(it, "i")).test(group.name));
      }
      return (new RegExp(searchText, "i")).test(group.name);
    };

    return groups
      .filter(it => it != null)
      .flatMap(group => [
        ...searchForGroups(group.groups, searchText),
        ...(group.groups || []).filter(searchNameFunc)
      ]);
  };

  export const searchForItems = (groups: Array<DocumentGroup> | null,
                                 searchText: string): Array<Document> => {
    if (groups == null)
      return [];

    searchText = searchText.toLowerCase();
    const searchWords = searchText.split(" ");

    const searchNameFunc = (item: Document) => {
      if (Settings.documentsMultiKeywordSearch) {
        return searchWords.every(it => (new RegExp(it, "i")).test(item.name));
      }
      return (new RegExp(searchText, "i")).test(item.name);
    };

    return groups
      .filter(it => it != null)
      .flatMap(group => [
        ...searchForItems(group.groups, searchText),
        ...(group.items || []).filter(searchNameFunc)
      ]);
  };
}
