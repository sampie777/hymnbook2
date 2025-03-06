import React, { PropsWithChildren, useState } from "react";
import { Song } from "../../../logic/db/models/Songs";
import { SongHistoryAction } from "../../../logic/db/models/SongHistory";
import useHistory from "../../../logic/songs/history/useHistory";

export interface SongHistoryProviderProps {
  setSong: (value: Song | undefined) => void;
  setIndex: (value: number) => void;
  setNextAction: (value: SongHistoryAction) => void;
}

export const SongHistoryProviderContext = React.createContext<SongHistoryProviderProps>({
  setSong: () => undefined,
  setIndex: () => undefined,
  setNextAction: () => undefined,
});

const SongHistoryProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [song, setSong] = useState<Song | undefined>();
  const [index, setIndex] = useState<number>(0);
  const [nextAction, setNextAction] = useState<SongHistoryAction>(SongHistoryAction.Unknown);

  useHistory(song, index, nextAction)

  const defaultContext: SongHistoryProviderProps = {
    setSong: setSong,
    setIndex: setIndex,
    setNextAction: setNextAction,
  };

  return <SongHistoryProviderContext.Provider value={defaultContext}>
    {children}
  </SongHistoryProviderContext.Provider>;
};

export default SongHistoryProvider;

export const useSongHistory = () => React.useContext(SongHistoryProviderContext);
