import React, { PropsWithChildren, useState } from "react";

export interface UpdatingSongBundle {
  uuid: string;
  progress?: number;
}

export interface UpdaterContextProps {
  songBundlesUpdating: UpdatingSongBundle[];
  addSongBundleUpdating: (obj: { uuid: string; progress?: number }) => void;
  updateSongBundleProgress: (uuid: string, progress: number) => void;
  removeSongBundleUpdating: (obj: { uuid: string }) => void;
  documentGroupsUpdating: { uuid: string }[];
  addDocumentGroupUpdating: (obj: { uuid: string }) => void;
  removeDocumentGroupUpdating: (obj: { uuid: string }) => void;
}

export const UpdaterContextProviderContext = React.createContext<UpdaterContextProps>({
  songBundlesUpdating: [],
  addSongBundleUpdating: () => null,
  updateSongBundleProgress: () => null,
  removeSongBundleUpdating: () => null,
  documentGroupsUpdating: [],
  addDocumentGroupUpdating: () => null,
  removeDocumentGroupUpdating: () => null,
});

const UpdaterContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [songBundlesUpdating, setSongBundlesUpdating] = useState<UpdatingSongBundle[]>([]);
  const [documentGroupsUpdating, setDocumentGroupsUpdating] = useState<{ uuid: string }[]>([]);

  const addSongBundleUpdating = (obj: { uuid: string; progress?: number }) =>
    setSongBundlesUpdating(prev => [
      ...prev.filter(it => it.uuid !== obj.uuid),
      { uuid: obj.uuid, progress: obj.progress ?? 0 }
    ]);

  const updateSongBundleProgress = (uuid: string, progress: number) =>
    setSongBundlesUpdating(prev =>
      prev.map(it => it.uuid === uuid ? { ...it, progress } : it)
    );

  const removeSongBundleUpdating = (obj: { uuid: string }) =>
    setSongBundlesUpdating(prev => prev.filter(it => it.uuid !== obj.uuid));

  const addDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating(prev => [...prev, obj]);

  const removeDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating(prev => prev.filter(it => it.uuid !== obj.uuid));

  const defaultContext: UpdaterContextProps = {
    songBundlesUpdating,
    addSongBundleUpdating,
    updateSongBundleProgress,
    removeSongBundleUpdating,
    documentGroupsUpdating,
    addDocumentGroupUpdating,
    removeDocumentGroupUpdating,
  };

  return <UpdaterContextProviderContext.Provider value={defaultContext}>
    {children}
  </UpdaterContextProviderContext.Provider>;
};

export default UpdaterContextProvider;

export const useUpdaterContext = () => React.useContext(UpdaterContextProviderContext);