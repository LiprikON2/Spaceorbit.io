import Phaser from "phaser";
import { createNanoEvents } from "nanoevents";
import type { Emitter } from "nanoevents";
import { geckos } from "@geckos.io/client";

import type { ClientScene } from "~/scenes/core/ClientScene";
import type { Spaceship } from "~/objects/Sprite/Spaceship";
import { GameClient, clientConfig } from "../GameClient";
import { type Settings, SettingsManager } from "./components";

export interface StatusEvent {
    name: string;
    progress: number;
}
export interface ConnectionErrorEvent {
    message: string;
    navigateToMode: "mainMenu" | "singleplayer" | "multiplayer";
}
export interface OutEvents {
    "world:create": () => void;
    loading: (status: StatusEvent) => void;
    connectionError: (errorDetails: ConnectionErrorEvent) => void;
}

export class GameManager {
    config: Phaser.Types.Core.GameConfig;
    game: GameClient;
    emitter: Emitter<OutEvents>;
    settings: SettingsManager;

    constructor(config: Phaser.Types.Core.GameConfig, settings: Partial<Settings> = {}) {
        this.config = config;
        this.settings = new SettingsManager(settings);
        this.emitter = createNanoEvents();
    }

    on = (event, callback) => {
        return this.emitter.on(event, callback);
    };

    init = async (isMultiplayer = false, url = "http://localhost:3010") => {
        let channel;
        if (isMultiplayer)
            channel = geckos({
                url,
                port: null,
            });

        const whenIsBooted = new Promise((resolve) => {
            this.game = new GameClient(
                {
                    ...this.config,
                    callbacks: { postBoot: () => resolve(true) },
                },
                this.settings,
                this.emitter,
                channel ?? undefined
            );
        });
        await whenIsBooted;

        const whenSceneCreated = new Promise((resolve) => {
            this.on("world:create", resolve);
        });
        await whenSceneCreated;

        return this;
    };

    lockInput = () => {
        this.game.input.enabled = false;
        this.game.input.keyboard.enabled = false;
        this.scene.input.enabled = false;
        this.scene.input.keyboard.enabled = false;
        // Prevents locked keys from sticking
        this.scene.input.keyboard.resetKeys();
    };
    unlockInput = () => {
        this.game.input.enabled = true;
        this.game.input.keyboard.enabled = true;
        this.scene.input.enabled = true;
        this.scene.input.keyboard.enabled = true;
        // Prevents locked keys from sticking
        this.scene.input.keyboard.resetKeys();
    };

    // TODO phaser registry?
    get scene(): ClientScene | null {
        const clientScene = this.game?.scene?.keys["UnnamedMapScene"] as ClientScene;
        return clientScene ?? null;
    }
    get player(): Spaceship | null {
        return this.scene?.player ?? null;
    }
    exit = () => {
        if (this.game.channel) setTimeout(() => this.game.channel.close(), 0);
        this.game.destroy(true);
    };
}

export const gameManager = new GameManager(clientConfig);
