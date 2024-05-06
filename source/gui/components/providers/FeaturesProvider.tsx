import React, { PropsWithChildren, useEffect, useState } from "react";
import { Features } from "../../../logic/features";
import { rollbar } from "../../../logic/rollbar";
import { sanitizeErrorForRollbar } from "../../../logic/utils";

type FeaturesContextProps = Features.Props & { loadFeatures: () => void };

export const FeaturesContext = React.createContext<FeaturesContextProps>({
  loaded: false,
  goldenEgg: false,
  loadFeatures: () => rollbar.warning("loadFeatures not implemented yet")
});

const FeaturesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [goldenEgg, setGoldenEgg] = useState(false);

  const loadFeatures = () => {
    try {
      Features.fetch()
        .then(features => {
          setLoaded(true);
          setGoldenEgg(features.goldenEgg);
        })
        .catch(() => null);
    } catch (error) {
      rollbar.error("Failed to initiate features fetching", {
        ...sanitizeErrorForRollbar(error)
      });
    }
  };

  const defaultContext: FeaturesContextProps = {
    loaded: loaded,
    goldenEgg: goldenEgg,
    loadFeatures: loadFeatures
  };

  return <FeaturesContext.Provider value={defaultContext}>
    {children}
  </FeaturesContext.Provider>;
};

export default FeaturesProvider;

export const useFeatures = () => React.useContext(FeaturesContext);
