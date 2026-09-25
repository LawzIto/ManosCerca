import { create } from "zustand";

type Coordinates = { latitude: number; longitude: number };

type LocationState = {
  coords: Coordinates | null;
  setCoords: (coords: Coordinates | null) => void;
};

/** Ubicación actual del usuario (estado de UI; los datos del servidor van en React Query). */
export const useLocationStore = create<LocationState>((set) => ({
  coords: null,
  setCoords: (coords) => set({ coords }),
}));
