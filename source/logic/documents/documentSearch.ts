import Settings from "../../settings";
import { Document, DocumentGroup } from "../db/models/documents/Documents";
import { InterruptedError } from "../InterruptedError.ts";
import Db from "../db/db.tsx";
import { SongSearch, } from "../songs/songSearch.ts";
import { DocumentGroupSchema, DocumentSchema } from "../db/models/documents/DocumentsSchema.ts";
import { getPathForDocumentOrDocumentGroup } from "./utils.ts";

export namespace DocumentSearch {
  export const titleMatchPoints = 2;
  export const contentMatchPoints = 1;

  export interface SearchResult {
    document?: Document & Realm.Object<Document>;
    group?: DocumentGroup & Realm.Object<DocumentGroup>;
    points: number;
    isTitleMatch: boolean;
    isContentMatch: boolean;
    path: string;
  }

  export enum OrderBy {
    Relevance = "Relevance",
    Group = "Group",
  }

  export type DbDocumentGroup = DocumentGroup & Realm.Object<DocumentGroup>;

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

  export const sort = (results: SearchResult[], order: OrderBy): SearchResult[] => {
    switch (order) {
      case OrderBy.Relevance:
        return results
          .sort((a, b) => a.path.localeCompare(b.path))
          .sort((a, b) => b.points - a.points)
          .sort((a, b) => {
            if (a.group != undefined && b.document != undefined) return -1
            if (a.document != undefined && b.group != undefined) return 1
            return 0
          })
      case OrderBy.Group:
        return results
          .sort((a, b) => (a.document?.index ?? 0) - (b.document?.index ?? 0))
          .sort((a, b) => a.path.localeCompare(b.path))
          .sort((a, b) => {
            if (a.group != undefined && b.document != undefined) return -1
            if (a.document != undefined && b.group != undefined) return 1
            return 0
          })
    }
    return results;
  };

  export const find = (text: string,
                       searchInTitles: boolean,
                       searchInContent: boolean,
                       selectedGroupUuids: string[],
                       shouldCancel?: () => boolean): SearchResult[] => {
    const groupResults: SearchResult[] = [];
    // Use the document id as index, to increase document lookup speed for the searchInContent step
    const results: { [key: string]: SearchResult } = {};

    if (searchInTitles) {
      findDocumentGroupsByTitle(text, selectedGroupUuids).forEach(it => {
        groupResults.push({
          group: it,
          points: calculateMatchPointsForTitleMatch(it.name),
          isTitleMatch: true,
          isContentMatch: false,
          path: getPathForDocumentOrDocumentGroup(it, false).map(it => it.name).join("  >  ")
        });
      });

      findDocumentsByTitle(text, selectedGroupUuids).forEach(it => {
        results[it.id] = {
          document: it,
          points: calculateMatchPointsForTitleMatch(it.name),
          isTitleMatch: true,
          isContentMatch: false,
          path: getPathForDocumentOrDocumentGroup(it, false).map(it => it.name).join("  >  ")
        };
      });
    }

    if (shouldCancel?.()) throw new InterruptedError();

    // Add content results to results
    if (searchInContent) {
      findByContent(text, selectedGroupUuids).forEach((it) => {
        if (shouldCancel?.()) throw new InterruptedError();

        // Calculating how much the match is worth
        const points = calculateMatchPointsForContentMatch(it, text);

        const existingResult = results[it.id];
        if (existingResult != null) {
          existingResult.points += points;
          existingResult.isContentMatch = true;
        } else {
          results[it.id] = {
            document: it,
            points: points,
            isTitleMatch: false,
            isContentMatch: true,
            path: getPathForDocumentOrDocumentGroup(it, false).map(it => it.name).join("  >  "),
          };
        }
      });
    }

    return [...groupResults, ...Object.values(results)];
  };

  export const findDocumentsByTitle = (text: string, selectedGroupUuids: string[] = []): (Document & Realm.Object<Document>)[] => {
    const documentGroupQuery = selectedGroupUuids.length == 0 ? ""
      : `AND ${createDocumentGroupFilterQuery(selectedGroupUuids)}`;
    const query = `name LIKE[c] "*${text}*" ${documentGroupQuery}`;

    const results = Db.documents.realm().objects<Document>(DocumentSchema.name)
      .sorted("name")
      .sorted("index")
      .filtered(query);

    return Array.from(results);
  };

  export const findDocumentGroupsByTitle = (text: string, selectedGroupUuids: string[] = []): (DocumentGroup & Realm.Object<DocumentGroup>)[] => {
    const documentGroupQuery = selectedGroupUuids.length == 0 ? ""
      : `AND ${createDocumentGroupFilterQuery(selectedGroupUuids)}`;
    const query = `name LIKE[c] "*${text}*" AND isRoot = false ${documentGroupQuery}`;

    const results = Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
      .sorted("name")
      .filtered(query);

    return Array.from(results);
  };

  export const findByContent = (text: string, selectedGroupUuids: string[] = []): (Document & Realm.Object<Document>)[] => {
    let query = `html LIKE[c] $0`;
    const args: any[] = [`*${text}*`];

    // Add wildcards to ignore some punctuation (max 1 at the moment)
    // ("ab, cd" will match "ab cd")
    if (/ .+/.test(text)) {
      for (let i = 0; i < text.length; i++) {
        if (text[i] != " ") continue;
        const regex = text.slice(0, i) + "?" + text.slice(i);
        query += ` or html LIKE[c] $${args.length}`;
        args.push(`*${regex}*`);
      }
    }

    if (selectedGroupUuids.length > 0) {
      query = `(${query}) AND ${createDocumentGroupFilterQuery(selectedGroupUuids)}`;
    }

    const results = Db.documents.realm().objects<Document>(DocumentSchema.name)
      .sorted("name")
      .sorted("index")
      .filtered(query, ...args);

    return Array.from(results);
  };

  export const calculateMatchPointsForTitleMatch = (title: string): number => {
    return titleMatchPoints / title.length;
  };

  export const calculateMatchPointsForContentMatch = (document: Document, text: string): number => {
    let result = 0;

    const regexText = SongSearch.makeSearchTextRegexable(text);
    const matches = document.html.match(new RegExp(regexText, "gi"));
    if (matches != null) {
      result += matches.length * contentMatchPoints;
    }

    const totalContentLines: number = document.html.split("\n").length;

    if (totalContentLines == 0) return 0;
    return result / totalContentLines;
  };

  export const createDocumentGroupFilterQuery = (selectedGroupsUuids: string[]) =>
    `ANY _parent.uuid in {${selectedGroupsUuids.map(it => `'${it}'`).join(", ")}}`;

  /**
   * This method collects all sub groups for a group. To increase efficiency, the goal is to prevent
   * iterating over groups we already scanned.
   * @param fromUuids
   */
  export const getGroupAndSubGroupScopeUuids = (fromUuids: string[]) => {
    const dontIncludeFromUuidsQuery = `NOT uuid IN {${fromUuids.map(it => `'${it}'`).join(", ")}} AND `;
    let allGroups = Array.from(Db.documents.realm().objects<DocumentGroup>(DocumentGroupSchema.name)
      .filtered(`${fromUuids.length > 0 ? dontIncludeFromUuidsQuery : ''} isRoot = false`))

    const results: string[] = [...fromUuids];

    let groupsToScan: string[] = [...results];
    let subGroupsFound: string[] = [];

    let previousLength = -1;
    // Check if the previous iteration resulted in results, otherwise we are done and can stop searching further
    while (results.length > previousLength) {
      previousLength = results.length;

      // Find sub groups for the already found groups
      groupsToScan.forEach(uuid => {
        allGroups.filter(it => it._parent && it._parent[0].uuid == uuid)
          .forEach(result => {
            subGroupsFound.push(result.uuid)
            results.push(result.uuid);

            // Reduce our search stack (not sure if this makes for more work or less work due to all the looping over)
            allGroups = allGroups.filter(it => it.id != result.id)
          })
      })

      groupsToScan = subGroupsFound;
      subGroupsFound = [];
    }

    return results;
  };

}
