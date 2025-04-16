import React, { PropsWithChildren, useState } from "react";
import { isDevelopmentEnv } from "../../../logic/utils";

export interface AppContextProps {
  developerMode: boolean;
  setDeveloperMode: (value: boolean) => void;
}

export const AppContextProviderContext = React.createContext<AppContextProps>({
  developerMode: false,
  setDeveloperMode: () => undefined
});

const AppContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [developerMode, setDeveloperMode] = useState(isDevelopmentEnv);

  const defaultContext: AppContextProps = {
    developerMode: developerMode,
    setDeveloperMode: setDeveloperMode
  };

  return <AppContextProviderContext.Provider value={defaultContext}>
    {children}
  </AppContextProviderContext.Provider>;
};

export default AppContextProvider;

export const useAppContext = () => React.useContext(AppContextProviderContext);