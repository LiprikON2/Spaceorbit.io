import Phaser from "phaser";
import { createNanoEvents } from "nanoevents";
import type { Emitter } from "nanoevents";
import { geckos } from "@geckos.io/client";

import type { ClientScene } from "~/scenes/core/ClientScene";
import type { Spaceship } from "~/objects";
import { GameClient, clientConfig } from "./client";

export interface StatusEvent {
    name: string;
    progress: number;
}
export interface ConnectionErrorEvent {
    message: string;
    navigateToMode: "mainMenu" | "singleplayer" | "multiplayer";
}
export interface OutEvents {
    worldCreate: () => void;
    loading: (status: StatusEvent) => void;
    connectionError: (errorDetails: ConnectionErrorEvent) => void;
}

export class GameManager {
    config: Phaser.Types.Core.GameConfig;
    game: GameClient;
    emitter: Emitter<OutEvents>;

    constructor(config) {
        this.config = config;
        this.emitter = createNanoEvents();
    }

    on = (event, callback) => {
        return this.emitter.on(event, callback);
    };

    init = async (settings, isMultiplayer = false, channelPort = 3010) => {
        let channel;
        if (isMultiplayer)
            channel = geckos({
                // TODO
                // url: `${location.protocol}//${location.hostname}:${channelPort}`,
                url: `${location.protocol}//192.168.1.246:${channelPort}`,
                port: null,
            });

        const whenIsBooted = new Promise((resolve) => {
            this.game = new GameClient(
                {
                    ...this.config,
                    callbacks: { postBoot: () => resolve(true) },
                },
                settings,
                this.emitter,
                channel ?? undefined
            );
        });
        await whenIsBooted;

        const whenSceneCreated = new Promise((resolve) => {
            this.on("worldCreate", resolve);
        });
        await whenSceneCreated;

        return this;
    };

    // TODO use this when ui modals are opened
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

    get scene(): ClientScene | null {
        const clientScene = this.game?.scene?.keys["UnnamedMapScene"] as ClientScene;
        return clientScene ?? null;
    }
    get player(): Spaceship | null {
        return this.scene?.player ?? null;
    }
    destroy = () => {
        this.game.destroy(true);
    };
}

export const gameManager = new GameManager(clientConfig);
