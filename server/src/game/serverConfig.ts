import "@geckos.io/phaser-on-nodejs";
import Phaser from "phaser";

import { ServerScene } from "./scenes/ServerScene";
import { MixinUnnamedMapScene, PreloadScene } from "@spaceorbit/client";
import { plugins } from "@spaceorbit/client/src/game/scripts/core/GameClient";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

const UnnamedMapSceneServer = MixinUnnamedMapScene(ServerScene);

export const serverConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.HEADLESS,
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [PreloadScene, UnnamedMapSceneServer],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: {},
        },
    },
    plugins: {
        global: plugins,
    },
};
