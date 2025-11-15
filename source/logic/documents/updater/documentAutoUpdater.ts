import { DocumentProcessor } from "../documentProcessor";
import { rollbar } from "../../rollbar";
import { sanitizeErrorForRollbar } from "../../utils/utils.ts";
import { DocumentGroup } from "../../db/models/documents/Documents";
import { DocumentServer } from "../documentServer";
import { DocumentUpdater } from "./documentUpdater";

export namespace DocumentAutoUpdater {
  export const run = async (
    addDocumentGroupUpdating: (bundle: { uuid: string }) => void,
    removeDocumentGroupUpdating: (bundle: { uuid: string }) => void,
    mayUseNetwork: () => boolean
  ) => {
    const groups = DocumentProcessor.loadLocalDocumentRoot()
      .filter(it => it.uuid.length > 0);
    if (groups.length == 0) return;

    const updates = await DocumentServer.fetchDocumentGroupUpdates();

    for (const group of groups) {
      if (!mayUseNetwork()) continue;

      // Check if group hasn't been deleted in the meantime
      if (!group.isValid()) continue;

      const hasUpdate = updates.some(update => update.uuid === group.uuid && update.hash != group.hash);
      if (!hasUpdate) continue;

      // Clone the group, as we're going to still need this object
      // after it has been deleted from the database during the update
      const clonedBundle = DocumentGroup.clone(group);

      console.debug(`Auto updating document bundle ${clonedBundle.name}...`)
      addDocumentGroupUpdating(clonedBundle);

      try {
        await DocumentUpdater.fetchAndUpdateDocumentGroup(clonedBundle)
      } catch (error) {
        rollbar.error("Failed to auto update document group", {
          ...sanitizeErrorForRollbar(error),
          bundle: clonedBundle,
        })
      } finally {
        removeDocumentGroupUpdating(clonedBundle);
      }
    }
  }
}