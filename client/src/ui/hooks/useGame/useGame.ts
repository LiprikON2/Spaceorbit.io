import type { ClientScene } from "~/scenes";
import type { Spaceship } from "~/objects";
import { produce } from "immer";
import { create } from "zustand";

import { gameManager, type GameManager } from "~/game/core/GameManager";

interface GameStore {
    gameManager: GameManager | null;
    mode: "mainMenu" | "singleplayer" | "multiplayer";
    computed: {
        isLoading: boolean;
        isLoaded: boolean;
        player: Spaceship | null;
        scene: ClientScene | null;
    };
    loadSingleplayer: (settings) => Promise<void>;
    loadMultiplayer: (settings) => Promise<void>;
    loadMainMenu: () => void;
}

export const useGame = create<GameStore>((set, get) => ({
    gameManager: null,
    mode: "mainMenu",

    // https://github.com/pmndrs/zustand/issues/132
    computed: {
        get isLoading() {
            return get().mode !== "mainMenu" && !get().computed.isLoaded;
        },
        get isLoaded() {
            return !!get().gameManager?.player;
        },

        get player() {
            return get().gameManager?.player;
        },
        get scene() {
            return get().gameManager?.scene;
        },
    },

    loadSingleplayer: async (settings) => {
        set(
            produce((state) => {
                state.mode = "singleplayer";
            })
        );
        const singleplayerGame = await gameManager.init(settings);

        set(
            produce((state) => {
                state.gameManager = singleplayerGame;
            })
        );
    },
    loadMultiplayer: async (settings) => {
        set(
            produce((state) => {
                state.mode = "multiplayer";
            })
        );
        const multiplayerGame = await gameManager.init(settings, true);

        set(
            produce((state) => {
                state.gameManager = multiplayerGame;
            })
        );
    },
    loadMainMenu: () => {
        const { gameManager } = get();
        if (gameManager) gameManager.destroy();
        set(
            produce((state) => {
                state.gameManager = null;
                state.mode = "mainMenu";
            })
        );
    },
}));
