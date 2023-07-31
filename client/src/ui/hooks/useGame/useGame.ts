import { produce } from "immer";
import { create } from "zustand";

import { gameManager, type GameManager } from "~/game/core/GameManager";
import type { ClientScene } from "~/scenes/core";
import type { Spaceship } from "~/objects/Sprite/Spaceship";

interface GameStore {
    gameManager: GameManager | null;
    mode: "mainMenu" | "exiting" | "singleplayer" | "multiplayer";
    computed: {
        isLoading: boolean;
        isLoaded: boolean;
        player: Spaceship | null;
        scene: ClientScene | null;
    };
    errors: string[];
    loadSingleplayer: (settings) => Promise<void>;
    loadMultiplayer: (settings) => Promise<void>;
    loadMainMenu: () => void;
    exit: (initiatedByUser?: boolean) => void;
    clearErrors: () => void;
}

export const useGame = create<GameStore>((set, get) => ({
    gameManager: null,
    mode: "mainMenu",
    errors: [],

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
        if (gameManager) gameManager.exit();

        set(
            produce((state) => {
                state.gameManager = null;
                state.mode = "mainMenu";
            })
        );
    },
    exit: (initiatedByUser = false) => {
        const { mode } = get();
        const wasConnectionLost = mode !== "mainMenu" && !initiatedByUser;

        if (wasConnectionLost) {
            set(
                produce((state) => {
                    state.errors = [...state.errors, "Connection to the server was lost"];
                })
            );
        }

        set(
            produce((state) => {
                state.mode = "exiting";
            })
        );
    },
    clearErrors: () => {
        set(
            produce((state) => {
                state.errors = [];
            })
        );
    },
}));
