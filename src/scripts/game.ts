import "phaser";
import MainScene from "./scenes/mainScene";
import HUDScene from "./scenes/hudScene";
import MouseWheelScrollerPlugin from "phaser3-rex-plugins/plugins/mousewheelscroller-plugin.js";
import PreloadScene from "./scenes/preloadScene";

const DEFAULT_WIDTH = 1920;
const DEFAULT_HEIGHT = 1080;

const config = {
    type: Phaser.AUTO,
    transparent: true,
    scale: {
        parent: "phaser-game",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
    },
    scene: [PreloadScene, MainScene, HUDScene],
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
        ],
    },
};

window.addEventListener("load", () => {
    const game = new Phaser.Game(config);
});
