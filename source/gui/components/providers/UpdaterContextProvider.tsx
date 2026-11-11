import React, { PropsWithChildren, useState } from "react";

export interface UpdaterContextProps {
  songBundlesUpdating: { uuid: string }[]
  addSongBundleUpdating: (obj: { uuid: string }) => void
  removeSongBundleUpdating: (obj: { uuid: string }) => void
  documentGroupsUpdating: { uuid: string }[]
  addDocumentGroupUpdating: (obj: { uuid: string }) => void
  removeDocumentGroupUpdating: (obj: { uuid: string }) => void
}

export const UpdaterContextProviderContext = React.createContext<UpdaterContextProps>({
  songBundlesUpdating: [],
  addSongBundleUpdating: () => null,
  removeSongBundleUpdating: () => null,
  documentGroupsUpdating: [],
  addDocumentGroupUpdating: () => null,
  removeDocumentGroupUpdating: () => null,
});

const UpdaterContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [songBundlesUpdating, setSongBundlesUpdating] = useState<{ uuid: string }[]>([]);
  const [documentGroupsUpdating, setDocumentGroupsUpdating] = useState<{ uuid: string }[]>([]);

  const addSongBundleUpdating = (obj: { uuid: string }) =>
    setSongBundlesUpdating(prev => (prev.some(it => it.uuid === obj.uuid) ? prev : [...prev, obj]));

  const removeSongBundleUpdating = (obj: { uuid: string }) =>
    setSongBundlesUpdating(prev => prev.filter(it => it.uuid !== obj.uuid));

  const addDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating(prev => (prev.some(it => it.uuid === obj.uuid) ? prev : [...prev, obj]));

  const removeDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating(prev => prev.filter(it => it.uuid !== obj.uuid));

  const defaultContext: UpdaterContextProps = {
    songBundlesUpdating,
    addSongBundleUpdating,
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
