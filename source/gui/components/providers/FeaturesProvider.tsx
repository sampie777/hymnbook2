import React, { PropsWithChildren, useEffect, useState } from "react";
import { Features } from "../../../logic/features";
import { checkShouldRollbarBeEnabled, disableRollbar, rollbar } from "../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../logic/utils";

type FeaturesContextProps = Features.Props & { loadFeatures: () => void };

export const FeaturesContext = React.createContext<FeaturesContextProps>({
  loaded: false,
  goldenEgg: false,
  enableSystemPay: true,
  allowLogging: true,
  loadFeatures: () => rollbar.warning("loadFeatures not implemented yet")
});

const FeaturesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [goldenEgg, setGoldenEgg] = useState(false);
  const [enableSystemPay, setEnableSystemPay] = useState(true);
  const [allowLogging, setAllowLogging] = useState(true);

  const loadFeatures = () => {
    try {
      Features.fetch()
        .then(features => {
          setLoaded(true);
          setGoldenEgg(features.goldenEgg);
          setEnableSystemPay(features.enableSystemPay);
          setAllowLogging(features.allowLogging);
        })
        .catch(() => null);
    } catch (error) {
      rollbar.error("Failed to initiate features fetching", {
        ...sanitizeErrorForRollbar(error)
      });
    }
  };

  // When features are loaded
  useEffect(() => {
    if (!loaded) return

    if (!allowLogging) disableRollbar();
    else checkShouldRollbarBeEnabled();
  }, [allowLogging]);

  const defaultContext: FeaturesContextProps = {
    loaded: loaded,
    goldenEgg: goldenEgg,
    enableSystemPay: enableSystemPay,
    allowLogging: allowLogging,
    loadFeatures: loadFeatures
  };

  return <FeaturesContext.Provider value={defaultContext}>
    {children}
  </FeaturesContext.Provider>;
};

export default FeaturesProvider;

export const useFeatures = () => React.useContext(FeaturesContext);
