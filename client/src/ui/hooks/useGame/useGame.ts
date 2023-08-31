import { produce } from "immer";
import { create } from "zustand";

import { GameManager } from "~/game/core/GameManager";
import { clientConfig } from "~/game/core/GameClient";
import type { ClientScene } from "~/scenes/core";
import type { Spaceship } from "~/objects/Sprite/Spaceship";
import type { SettingsManager } from "~/game/core/GameManager/components";

interface GameStore {
    gameManager: GameManager | null;
    mode: "mainMenu" | "exiting" | "singleplayer" | "multiplayer";
    computed: {
        isLoading: boolean;
        isLoaded: boolean;
        player: Spaceship | null;
        scene: ClientScene | null;
        settings: SettingsManager;
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
    gameManager: new GameManager(clientConfig),
    mode: "mainMenu",
    errors: [],
    selectedServer: null,

    // https://github.com/pmndrs/zustand/issues/132
    computed: {
        get isLoading() {
            return get().mode !== "mainMenu" && !get().computed.isLoaded;
        },
        get isLoaded() {
            return !!get().gameManager.player;
        },

        get player() {
            return get().gameManager.player;
        },
        get scene() {
            return get().gameManager.scene;
        },

        get settings() {
            return get().gameManager.settings;
        },
    },

    loadSingleplayer: async (settings) => {
        set(
            produce((state) => {
                state.mode = "singleplayer";
            })
        );
        const gameManager = await get().gameManager.init();
        // TODO remove manual rerender
        set(
            produce((state) => {
                state.gameManager = null;
                state.gameManager = gameManager;
            })
        );
    },
    loadMultiplayer: async (settings, url) => {
        set(
            produce((state) => {
                state.mode = "multiplayer";
            })
        );
        const gameManager = await get().gameManager.init(true, url);
        // TODO remove manual rerender
        set(
            produce((state) => {
                state.gameManager = null;
                state.gameManager = gameManager;
            })
        );
    },
    loadMainMenu: () => {
        const { gameManager } = get();
        gameManager.exit();

        set(
            produce((state) => {
                // TODO remove manual rerender
                state.gameManager = null;
                state.gameManager = gameManager;
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
