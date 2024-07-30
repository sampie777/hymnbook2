import React, { PropsWithChildren, useState } from "react";

export interface UpdaterContextProps {
  songBundlesUpdating: { uuid: string }[]
  addSongBundleUpdating: (bundle: { uuid: string }) => void
  removeSongBundleUpdating: (bundle: { uuid: string }) => void
}

export const UpdaterContextProviderContext = React.createContext<UpdaterContextProps>({
  songBundlesUpdating: [],
  addSongBundleUpdating: () => null,
  removeSongBundleUpdating: () => null,
});

const UpdaterContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [songBundlesUpdating, setSongBundlesUpdating] = useState<{ uuid: string }[]>([]);

  const addSongBundleUpdating = (bundle: { uuid: string }) => {
    setSongBundlesUpdating([...songBundlesUpdating, bundle]);
  }

  const removeSongBundleUpdating = (bundle: { uuid: string }) => {
    setSongBundlesUpdating(songBundlesUpdating.filter(it => it.uuid !== bundle.uuid));
  }

  const defaultContext: UpdaterContextProps = {
    songBundlesUpdating: songBundlesUpdating,
    addSongBundleUpdating: addSongBundleUpdating,
    removeSongBundleUpdating: removeSongBundleUpdating,
  };

  return <UpdaterContextProviderContext.Provider value={defaultContext}>
    {children}
  </UpdaterContextProviderContext.Provider>;
};

export default UpdaterContextProvider;

export const useUpdaterContext = () => React.useContext(UpdaterContextProviderContext);