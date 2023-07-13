import "@geckos.io/phaser-on-nodejs";
import Phaser from "phaser";

import { ServerScene } from "./scenes/ServerScene";
import { MixinUnnamedMapScene, PreloadScene } from "@spaceorbit/client";

// import MouseWheelScrollerPlugin from "phaser3-rex-plugins/plugins/mousewheelscroller-plugin.js";
// import RotateToPlugin from "phaser3-rex-plugins/plugins/rotateto-plugin.js";
// import SoundFadePlugin from "phaser3-rex-plugins/plugins/soundfade-plugin.js";
// import MoveToPlugin from "phaser3-rex-plugins/plugins/moveto-plugin.js";
// import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
// import ButtonPlugin from "phaser3-rex-plugins/plugins/button-plugin.js";

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
    // plugins: {
    //     global: [
    //         {
    //             key: "rexMouseWheelScroller",
    //             plugin: MouseWheelScrollerPlugin,
    //             start: true,
    //         },
    //         {
    //             key: "rexRotateTo",
    //             plugin: RotateToPlugin,
    //             start: true,
    //         },
    //         {
    //             key: "rexSoundFade",
    //             plugin: SoundFadePlugin,
    //             start: true,
    //         },
    //         {
    //             key: "rexMoveTo",
    //             plugin: MoveToPlugin,
    //             start: true,
    //         },
    //         {
    //             key: "rexVirtualJoystick",
    //             plugin: VirtualJoystickPlugin,
    //             start: true,
    //         },
    //         {
    //             key: "rexButton",
    //             plugin: ButtonPlugin,
    //             start: true,
    //         },
    //     ],
    // },
    // input: {
    //     gamepad: true,
    // },
};
