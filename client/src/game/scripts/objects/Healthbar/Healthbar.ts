import ContainerLite from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/ContainerLite";
import type CustomShape from "phaser3-rex-plugins/plugins/gameobjects/shape/customshapes/CustomShapes";

import type { BaseScene } from "../../scenes/core";
import type { Spaceship } from "../Sprite/Spaceship";
import { BarShape } from "./components";

export interface HealthbarClientOptions {
    scene: BaseScene;
    ship: Spaceship;
    width?: number;
    height?: number;
    toFlip?: boolean;
    x?: number;
    y?: number;
    fillColor?: number;
    strokeWidth?: number;
}

type Point = { x: number; y: number };

const defaultClientOptions = {
    width: 200,
    // height: 8,
    height: 16,
    toFlip: false,
    x: 0,
    y: 0,
    fillColor: 0x03c0c4,
    strokeWidth: 2,
};

export class Healthbar {
    frameShape: BarShape;
    fillShape: BarShape;
    ship: Spaceship;
    scene: BaseScene;
    box: ContainerLite;

    maxWidth: number;
    constructor(clientOptions: HealthbarClientOptions) {
        const mergedClientOptions = { ...defaultClientOptions, ...clientOptions };

        const { scene } = mergedClientOptions;
        this.scene = scene;
        const { ship } = mergedClientOptions;
        this.ship = ship;

        const { width, height } = mergedClientOptions;
        this.maxWidth = width;

        const { strokeWidth, toFlip } = mergedClientOptions;
        this.frameShape = new BarShape({ scene: this.scene, width, height, toFlip });
        this.fillShape = new BarShape({
            scene: this.scene,
            width,
            height: height - strokeWidth,
            toFlip,
        });

        this.frameShape
            .setDepth(this.ship.depth + 5)
            .setFillStyle(0x786868, 1)
            .setStrokeStyle(strokeWidth, 0x9a9894, 1)
            .setAlpha(0.8);

        const { fillColor } = mergedClientOptions;
        this.fillShape
            .setDepth(this.ship.depth + 6)
            .setFillStyle(fillColor, 1)
            .setStrokeStyle(undefined, undefined, undefined);

        const { x, y } = mergedClientOptions;
        this.frameShape.setPosition(x, y);
        this.fillShape.setPosition(x, y);

        this.box = this.scene.add.rexContainerLite();
        this.box.pin([this.frameShape, this.fillShape]);
    }

    flip(point: Point, height: number): Point {
        return { x: point.x, y: point.y * -1 + height };
    }

    setProgress(progressPercentage: number = 1) {
        this.fillShape.setProgress(progressPercentage);
    }

    update(time: number, delta: number) {
        // // 0% - 2.9%
        // const nextVal = (val, min = 0, max = 0.029, step = 0.002) => {
        // 2.9% - 10%
        const nextVal = (val, min = 0.029, max = 0.1, step = 0.005) => {
            const newVal = val + step;
            if (newVal > max) return min;
            else return newVal;
        };

        // if (Phaser.Math.FloatBetween(0, 1) > 0.99) {
        //     this.setProgress(nextVal(this.fillShape.progress));
        // }
    }
}
