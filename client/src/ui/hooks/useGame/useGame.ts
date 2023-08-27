import { produce } from "immer";
import { create } from "zustand";

import { gameManager, type GameManager } from "~/game/core/GameManager/GameManager";
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
    selectedServer: string | null;
    loadSingleplayer: (settings) => Promise<void>;
    loadMultiplayer: (settings, url: string) => Promise<void>;
    loadMainMenu: () => void;
    exit: (initiatedByUser?: boolean) => void;
    clearErrors: () => void;
    setSelectedServer: (server: string) => void;
}

export const useGame = create<GameStore>((set, get) => ({
    gameManager: null,
    mode: "mainMenu",
    errors: [],
    selectedServer: null,

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
        const singleplayerGame = await gameManager.init();

        set(
            produce((state) => {
                state.gameManager = singleplayerGame;
            })
        );
    },
    loadMultiplayer: async (settings, url) => {
        set(
            produce((state) => {
                state.mode = "multiplayer";
            })
        );
        const multiplayerGame = await gameManager.init(true, url);

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
    setSelectedServer: (server) => {
        set(
            produce((state) => {
                state.selectedServer = server;
            })
        );
    },
}));
