import type { ClientChannel } from "@geckos.io/client";

import type { GameExtended } from "../../core";

/**
 * BaseScene is a scene, which provides shared logic between ClientScene and ServerScene
 */
export class BaseScene extends Phaser.Scene {
    game: GameExtended;
    channel?: ClientChannel;
    rootElem: HTMLElement;

    constructor(config: string | Phaser.Types.Scenes.SettingsConfig) {
        super(config);
        this.rootElem = document.getElementById("phaser-game");
    }

    init({ channel }: { channel?: ClientChannel }) {
        this.channel = channel;
    }

    create() {}

    update(time: number, delta: number) {}

    get isSingleplayer() {
        return !this.isMultiplayer;
    }
    get isMultiplayer() {
        return Boolean(this.channel);
    }

    makePlayer() {
        if (this.isSingleplayer) {
            // this.player = new Spaceship(...
        } else {
            // this.channel.emit("createPlayer"...
        }

        return new Promise((resolve) => {
            //...
        });
    }
}
