import { useState, useEffect } from "react";
import { soundEffects } from "../services/soundEffects";

export function useSoundEffects() {
  const [isEnabled, setIsEnabled] = useState(soundEffects.getIsEnabled());

  useEffect(() => {
    return soundEffects.subscribe(() => {
      setIsEnabled(soundEffects.getIsEnabled());
    });
  }, []);

  return {
    isEnabled,
    toggleSoundEffects: () => soundEffects.toggle(),
    setEnabled: (enabled: boolean) => soundEffects.setEnabled(enabled),
    playClick: () => soundEffects.playClick(),
    playDispatch: () => soundEffects.playDispatch(),
    playAlert: () => soundEffects.playAlert(),
  };
}
