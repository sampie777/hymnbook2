import React, { useEffect, useState } from "react";
import { Features } from "../../logic/features";
import { rollbar } from "../../logic/rollbar";

export const FeaturesContext = React.createContext<Features.Props>({
  loaded: false,
  goldenEgg: false
});

const FeaturesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loaded, setLoaded] = useState(false);
  const [goldenEgg, setGoldenEgg] = useState(false);

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = () => {
    try {
      Features.fetch()
        .then(features => {
          setLoaded(true);
          setGoldenEgg(features.goldenEgg);
        })
        .catch(() => null);
    } catch (e: any) {
      rollbar.error("Failed to initiate features fetching", {
        error: e,
        errorName: e.name
      });
    }
  };

  const defaultContext: Features.Props = {
    loaded: loaded,
    goldenEgg: goldenEgg
  };

  return <FeaturesContext.Provider value={defaultContext}>
    {children}
  </FeaturesContext.Provider>;
};

export default FeaturesProvider;

export const useFeatures = () => React.useContext(FeaturesContext);
