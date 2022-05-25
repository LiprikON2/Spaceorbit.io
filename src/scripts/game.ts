import "phaser";
import MainScene from "./scenes/mainScene";
import MouseWheelScrollerPlugin from "phaser3-rex-plugins/plugins/mousewheelscroller-plugin.js";
import RotateToPlugin from "phaser3-rex-plugins/plugins/rotateto-plugin.js";
import PreloadScene from "./scenes/preloadScene";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;
// const DEFAULT_WIDTH = 920;
// const DEFAULT_HEIGHT = 800;

// const graphicsSettings = { best: 1, medium: 0.75, low: 0.5 };
// const DPR = window.devicePixelRatio * graphicsSettings.low;
// // const { width, height } = window.screen;
// const { width, height } = { width: 1920, height: 1080 };

// // Set width and height.
// const WIDTH = Math.round(Math.max(width, height) * DPR);
// const HEIGHT = Math.round(Math.min(width, height) * DPR);

const config = {
    type: Phaser.AUTO,
    transparent: true,
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        // mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [PreloadScene, MainScene],
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
        ],
    },
};

let game;
export const createGame = () => {
    game = new Phaser.Game(config);
};

export const getGame = () => {
    return game;
};
