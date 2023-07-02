import Phaser from "phaser";
import { createNanoEvents } from "nanoevents";
import type { Emitter } from "nanoevents";

import { MainScene } from "~/scenes";
import type { Spaceship } from "~/objects";
import { GameExtended } from ".";
import { gameConfig } from ".";

interface Events {
    loading: (report: { name: string; progress: number }) => void;
}

export class GameManager {
    config: Phaser.Types.Core.GameConfig;
    game: GameExtended;
    emitter: Emitter<Events>;

    constructor(config) {
        this.config = config;
        this.emitter = createNanoEvents();
    }

    on = (event, callback) => {
        return this.emitter.on(event, callback);
    };

    init = async (settings) => {
        console.log("Booting");
        const whenIsBooted = new Promise((resolve) => {
            this.game = new GameExtended(
                {
                    ...this.config,
                    callbacks: { postBoot: () => resolve(true) },
                },
                settings,
                this.emitter
            );
        });
        await whenIsBooted;
        console.log("Booted");
        console.log("Creating");

        const whenSceneCreated = new Promise((resolve) => {
            const MainScene = this.game.scene.keys.MainScene as MainScene;
            MainScene.events.on("create", resolve);
        });
        await whenSceneCreated;

        console.log("Created");

        return this;
    };
    initMultiplayer = async (settings) => {};

    // TODO use this when ui modals are opened
    lockInput = () => {
        this.game.input.keyboard.enabled = false;
    };
    unlockInput = () => {
        this.game.input.keyboard.enabled = false;
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
