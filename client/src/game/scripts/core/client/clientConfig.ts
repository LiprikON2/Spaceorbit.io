import Phaser from "phaser";
import MouseWheelScrollerPlugin from "phaser3-rex-plugins/plugins/mousewheelscroller-plugin.js";
import RotateToPlugin from "phaser3-rex-plugins/plugins/rotateto-plugin.js";
import SoundFadePlugin from "phaser3-rex-plugins/plugins/soundfade-plugin.js";
import MoveToPlugin from "phaser3-rex-plugins/plugins/moveto-plugin.js";
import VirtualJoystickPlugin from "phaser3-rex-plugins/plugins/virtualjoystick-plugin.js";
import ButtonPlugin from "phaser3-rex-plugins/plugins/button-plugin.js";
import ContainerLitePlugin from "phaser3-rex-plugins/plugins/containerlite-plugin.js";

import { PreloadScene } from "~/scenes/core";
import { UnnamedMapScene } from "~/game/scenes/maps/UnnamedMapScene";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
// const DEFAULT_WIDTH = 960;
// const DEFAULT_HEIGHT = 540;

// const graphicsSettings = { best: 1, medium: 0.75, low: 0.5 };
// const DPR = window.devicePixelRatio * graphicsSettings.low;
// // const { width, height } = window.screen;
// const { width, height } = { width: 1920, height: 1080 };

// // Set width and height.
// const WIDTH = Math.round(Math.max(width, height) * DPR);
// const HEIGHT = Math.round(Math.min(width, height) * DPR);

export const clientConfig: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    fps: {
        // target: 10,
        // forceSetTimeOut: true,
    },
    transparent: true,
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        // mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [PreloadScene, UnnamedMapScene],
    physics: {
        default: "arcade",
        arcade: {
            debug: false,
            gravity: {},
        },
    },
    plugins: {
        global: [
            {
                key: "rexMouseWheelScroller",
                plugin: MouseWheelScrollerPlugin,
                start: true,
            },
            {
                key: "rexRotateTo",
                plugin: RotateToPlugin,
                start: true,
            },
            {
                key: "rexSoundFade",
                plugin: SoundFadePlugin,
                start: true,
            },
            {
                key: "rexMoveTo",
                plugin: MoveToPlugin,
                start: true,
            },
            {
                key: "rexVirtualJoystick",
                plugin: VirtualJoystickPlugin,
                start: true,
            },
            {
                key: "rexButton",
                plugin: ButtonPlugin,
                start: true,
            },
            {
                key: "rexContainerLitePlugin",
                plugin: ContainerLitePlugin,
                start: true,
            },
        ],
    },
    input: {
        gamepad: true,
    },
};
