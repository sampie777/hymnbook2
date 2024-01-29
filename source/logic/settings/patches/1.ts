import Settings from "../../../settings";
import { SongSearch } from "../../songs/songSearch";
import StringSearchButtonPlacement = SongSearch.StringSearchButtonPlacement;

export const patch1_ConvertingStringSearchButtonPlacementEnumToStringIndexed = () => {
  if (isNaN(+Settings.stringSearchButtonPlacement)) return; // Patch already applied

  switch (Settings.stringSearchButtonPlacement as unknown as number) {
    case 0:
      return Settings.stringSearchButtonPlacement = StringSearchButtonPlacement.TopLeft;
    case 1:
      return Settings.stringSearchButtonPlacement = StringSearchButtonPlacement.BottomRight;
    case 2:
      return Settings.stringSearchButtonPlacement = StringSearchButtonPlacement.BottomRight;
    case 3:
      return Settings.stringSearchButtonPlacement = StringSearchButtonPlacement.BottomLeft;
    default:
      return Settings.stringSearchButtonPlacement = StringSearchButtonPlacement.BottomRight;
  }
};