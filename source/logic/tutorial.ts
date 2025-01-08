import Settings from "../settings";

export namespace Tutorial {
  export const needToShow = () => !isCompleted()

  export const isCompleted = () => Settings.tutorialCompleted;

  export const complete = () => {
    Settings.tutorialCompleted = true;
    Settings.store();
  };
}
