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
    setSongBundlesUpdating([...songBundlesUpdating, obj]);

  const removeSongBundleUpdating = (obj: { uuid: string }) =>
    setSongBundlesUpdating(songBundlesUpdating.filter(it => it.uuid !== obj.uuid));

  const addDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating([...documentGroupsUpdating, obj]);

  const removeDocumentGroupUpdating = (obj: { uuid: string }) =>
    setDocumentGroupsUpdating(documentGroupsUpdating.filter(it => it.uuid !== obj.uuid));

  const defaultContext: UpdaterContextProps = {
    songBundlesUpdating: songBundlesUpdating,
    addSongBundleUpdating: addSongBundleUpdating,
    removeSongBundleUpdating: removeSongBundleUpdating,
    documentGroupsUpdating: documentGroupsUpdating,
    addDocumentGroupUpdating: addDocumentGroupUpdating,
    removeDocumentGroupUpdating: removeDocumentGroupUpdating,
  };

  return <UpdaterContextProviderContext.Provider value={defaultContext}>
    {children}
  </UpdaterContextProviderContext.Provider>;
};

export default UpdaterContextProvider;

export const useUpdaterContext = () => React.useContext(UpdaterContextProviderContext);