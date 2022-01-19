import { DocumentGroup, Document } from "../../models/Documents";

export namespace DocumentSearch {
  export const searchForItems = (groups: Array<DocumentGroup> | null,
                                 searchText: string): Array<Document> => {
    if (groups == null)
      return [];

    searchText = searchText.toLowerCase();

    return groups
      .filter(it => it != null)
      .flatMap(group => [
        ...searchForItems(group.groups, searchText),
        ...(group.items || []).filter(it => it.name.toLowerCase().includes(searchText))
      ]);
  };
}
