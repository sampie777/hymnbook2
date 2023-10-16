import { Song, SongAudio } from "../../db/models/Songs";
import { Server } from "../../server/server";

export namespace AudioFiles {
  export const fetchAll = (song: Song): Promise<SongAudio[]> => {
    return Server.fetchAudioFilesForSong(song);
  };
}