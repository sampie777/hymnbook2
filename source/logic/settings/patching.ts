import Db from "../db/db";
import { SettingPatch } from "../db/models/Settings";
import { SettingPatchSchema } from "../db/models/SettingsSchema";
import { patch1_ConvertingStringSearchButtonPlacementEnumToStringIndexed } from "./patches/1";
import { rollbar } from "../rollbar";
import { sanitizeErrorForRollbar } from "../utils";
import { patch2_PreFillSettingsSongSearchSelectedSongBundleUuids } from "./patches/2";

const patches: { [key: number]: () => any } = {
  1: patch1_ConvertingStringSearchButtonPlacementEnumToStringIndexed,
  2: patch2_PreFillSettingsSongSearchSelectedSongBundleUuids
};

const isPatchIdApplied = (appliedPatches: Realm.Results<SettingPatch & Realm.Object<SettingPatch>>, id: number) =>
  appliedPatches.some(it => it.id == id);

const markPatchAsApplied = (id: number) => new Promise<void>((resolve, reject) => {
  const patch = new SettingPatch(id);

  try {
    Db.settings.realm().write(() => {
      Db.settings.realm().create(SettingPatchSchema.name, patch);
      resolve();
    });
  } catch (error) {
    rollbar.error("Failed to mark patch as applied", {
      ...sanitizeErrorForRollbar(error),
      patch: patch
    });
    reject(error);
  }
});

const applyPatch = async (id: number) => {
  try {
    await patches[id]();
    await markPatchAsApplied(id);
  } catch (error) {
    rollbar.error("Failed to apply patch", {
      ...sanitizeErrorForRollbar(error),
      patchId: id
    });
  }
};

export const applyPatches = async () => {
  const appliedPatches = Db.settings.realm()
    .objects<SettingPatch>(SettingPatchSchema.name);

  const missingPatches = Object.keys(patches)
    .map(id => +id)
    .filter(id => !isPatchIdApplied(appliedPatches, id))
    .sort((a, b) => a - b);

  for (const id of missingPatches) {
    await applyPatch(id);
  }
};