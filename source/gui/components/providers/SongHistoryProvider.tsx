import React, { PropsWithChildren, useState } from "react";
import { Song } from "../../../logic/db/models/songs/Songs";
import { SongHistoryAction } from "../../../logic/db/models/songs/SongHistory";
import useHistory from "../../../logic/songs/history/useHistory";
import { SongListSongModel } from "../../../logic/db/models/songs/SongListModel";

export interface SongHistoryProviderProps {
  setSong: (value: Song | undefined) => void;
  setIndex: (value: number) => void;
  setNextAction: (value: SongHistoryAction) => void;
  setSongListItem: (value: SongListSongModel | undefined) => void;
}

export const SongHistoryProviderContext = React.createContext<SongHistoryProviderProps>({
  setSong: () => undefined,
  setIndex: () => undefined,
  setNextAction: () => undefined,
  setSongListItem: () => undefined,
});

const SongHistoryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [song, setSong] = useState<Song | undefined>();
  const [index, setIndex] = useState<number>(0);
  const [nextAction, setNextAction] = useState<SongHistoryAction>(SongHistoryAction.Unknown);
  const [songListItem, setSongListItem] = useState<SongListSongModel | undefined>();

  useHistory(song, index, nextAction, songListItem)

  const defaultContext: SongHistoryProviderProps = {
    setSong: setSong,
    setIndex: setIndex,
    setNextAction: setNextAction,
    setSongListItem: setSongListItem,
  };

  return <SongHistoryProviderContext.Provider value={defaultContext}>
    {children}
  </SongHistoryProviderContext.Provider>;
};

export default SongHistoryProvider;

export const useSongHistory = () => React.useContext(SongHistoryProviderContext);
