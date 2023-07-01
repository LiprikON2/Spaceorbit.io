import { MainScene } from "~/scenes";
import type { Spaceship } from "~/objects";
import { produce } from "immer";
import { create } from "zustand";

import { game } from "~/game/core/game";
import type { Game } from "~/game/core/game";

interface GameStore {
    game: Game | null;
    mode: "mainMenu" | "singleplayer" | "multiplayer";
    computed: {
        isLoading: boolean;
        isLoaded: boolean;
        player: Spaceship | null;
        scene: MainScene | null;
    };
    loadSingleplayer: (settings) => Promise<void>;
    loadMultiplayer: (settings) => Promise<void>;
    loadMainMenu: () => void;
}

export const useGame = create<GameStore>((set, get) => ({
    game: null,
    mode: "mainMenu",

    // https://github.com/pmndrs/zustand/issues/132
    computed: {
        get isLoading() {
            return get().mode !== "mainMenu" && !get().computed.isLoaded;
        },
        get isLoaded() {
            return !!get().game?.player;
        },

        get player() {
            return get().game?.player;
        },
        get scene() {
            return get().game?.scene;
        },
    },

    loadSingleplayer: async (settings) => {
        set(
            produce((state) => {
                state.mode = "singleplayer";
            })
        );
        const singleplayerGame = await game.init(settings);

        set(
            produce((state) => {
                state.game = singleplayerGame;
            })
        );
    },
    loadMultiplayer: async (settings) => {
        set(
            produce((state) => {
                state.mode = "multiplayer";
            })
        );
        const multiplayerGame = await game.init(settings);
        set(
            produce((state) => {
                state.game = multiplayerGame;
            })
        );
    },
    loadMainMenu: () => {
        get().game.destroy();
        set(
            produce((state) => {
                state.game = null;
                state.mode = "mainMenu";
            })
        );
    },
}));
