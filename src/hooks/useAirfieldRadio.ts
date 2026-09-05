import { useState, useEffect } from "react";
import { airfieldAudio, RadioChannel, RadioTransmission } from "../services/airfieldAudio";

export function useAirfieldRadio() {
  const [state, setState] = useState(airfieldAudio.getState());

  useEffect(() => {
    return airfieldAudio.subscribe(() => {
      setState(airfieldAudio.getState());
    });
  }, []);

  return {
    isMuted: state.isMuted,
    volume: state.volume,
    activeChannel: state.activeChannel,
    isTransmitting: state.isTransmitting,
    currentTransmission: state.currentTransmission as RadioTransmission | null,
    toggleMute: () => airfieldAudio.toggleMute(),
    setMuted: (muted: boolean) => airfieldAudio.setMuted(muted),
    setVolume: (vol: number) => airfieldAudio.setVolume(vol),
    setChannel: (channel: RadioChannel) => airfieldAudio.setChannel(channel),
    triggerNext: (lang?: "en" | "ar") => airfieldAudio.triggerNextTransmission(lang),
  };
}
