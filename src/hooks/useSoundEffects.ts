import { useState, useEffect } from "react";
import { soundEffects } from "../services/soundEffects";

export function useSoundEffects() {
  const [isEnabled, setIsEnabled] = useState(soundEffects.getIsEnabled());
  const [profile, setProfileState] = useState(soundEffects.getProfile());
  const [isHapticsEnabled, setIsHapticsEnabled] = useState(soundEffects.getIsHapticsEnabled());

  useEffect(() => {
    return soundEffects.subscribe(() => {
      setIsEnabled(soundEffects.getIsEnabled());
      setProfileState(soundEffects.getProfile());
      setIsHapticsEnabled(soundEffects.getIsHapticsEnabled());
    });
  }, []);

  return {
    isEnabled,
    profile,
    isHapticsEnabled,
    toggleSoundEffects: () => soundEffects.toggle(),
    setEnabled: (enabled: boolean) => soundEffects.setEnabled(enabled),
    setProfile: (p: "chime" | "penetrating") => soundEffects.setProfile(p),
    setHapticsEnabled: (enabled: boolean) => soundEffects.setHapticsEnabled(enabled),
    playClick: () => soundEffects.playClick(),
    playDispatch: () => soundEffects.playDispatch(),
    playAlert: () => soundEffects.playAlert(),
    triggerHaptic: (pattern?: number | number[]) => soundEffects.triggerHaptic(pattern),
  };
}
