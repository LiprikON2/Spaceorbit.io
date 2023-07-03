import Phaser from "phaser";
import { createNanoEvents } from "nanoevents";
import type { Emitter } from "nanoevents";

import { MainScene } from "~/scenes";
import type { Spaceship } from "~/objects";
import { GameExtended } from ".";
import { gameConfig } from ".";
import { geckos } from "@geckos.io/client";

export interface OutEvents {
    loading: (report: { name: string; progress: number }) => void;
}

export class GameManager {
    config: Phaser.Types.Core.GameConfig;
    game: GameExtended;
    emitter: Emitter<OutEvents>;

    constructor(config) {
        this.config = config;
        this.emitter = createNanoEvents();
    }

    on = (event, callback) => {
        return this.emitter.on(event, callback);
    };

    init = async (settings, isMultiplayer = false, channelPort = 1444) => {
        let channel;
        if (isMultiplayer) channel = geckos({ port: 1444 });

        const whenIsBooted = new Promise((resolve) => {
            this.game = new GameExtended(
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
            const MainScene = this.game.scene.keys.MainScene as MainScene;
            MainScene.events.on("create", resolve);
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

    get scene(): MainScene | null {
        const mainScene = this.game?.scene?.keys?.MainScene as MainScene;
        return mainScene ?? null;
    }
    get player(): Spaceship | null {
        return this.scene?.player ?? null;
    }
    destroy = () => {
        this.game.destroy(false);
    };
}

export const gameManager = new GameManager(gameConfig);
