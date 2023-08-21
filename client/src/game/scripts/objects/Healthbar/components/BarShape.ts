import CustomShape from "phaser3-rex-plugins/plugins/gameobjects/shape/customshapes/CustomShapes";
import { Lines } from "phaser3-rex-plugins/plugins/gameobjects/shape/shapes/geoms";

type Point = { x: number; y: number };

interface BarShapeClientOptions {
    scene: Phaser.Scene;
    width: number;
    height: number;
    toFlip?: boolean;
}

export class BarShape extends CustomShape {
    progress = 1;
    subPercentCoef = 0;

    height;
    width;
    flipped = false;
    constructor(options: BarShapeClientOptions) {
        super(options.scene, {
            create: [{ name: "bar", type: "lines" }],
            // create: { lines: 1 },
        });
        this.scene.add.existing(this);
        this.setOrigin(0.5);

        const { width, height, toFlip } = options;
        this.width = width;
        this.height = height;
        this.flipped = toFlip;

        window["test"] = this;

        this.setUpdateShapesCallback(() => {
            const progress = this.progress;
            const { left, topLeft, topRight, right, bottomRight, bottomLeft } = this.getPoints();

            const shape = this.getShapes()[0];

            // const cornerWidth = topLeft.x - left.x;
            // const cornerWidthRatio = cornerWidth / width;

            // console.log("widht", width);
            // console.log("cornerWidth", cornerWidth);
            // console.log("cornerWidthRatio", cornerWidthRatio);
            if (progress > this.cornerWidthRatio) {
                // Range: 0.028 - 1 -> becomes: 0 - 1
                const normalizedProgress =
                    (progress - this.cornerWidthRatio) / (1 - this.cornerWidthRatio);
                const progressWidth = width * normalizedProgress;
                shape
                    .lineStyle(this.lineWidth, this.strokeColor, this.strokeAlpha)
                    .fillStyle(this.fillColor, this.fillAlpha)
                    // @ts-ignore
                    .startAt(left.x, left.y)
                    .lineTo(topLeft.x, topLeft.y)
                    .lineTo(topRight.x + progressWidth, topRight.y)
                    .lineTo(right.x + progressWidth, right.y)
                    .lineTo(bottomRight.x + progressWidth, bottomRight.y)
                    .lineTo(bottomLeft.x, bottomLeft.y)
                    .lineTo(left.x, left.y)
                    .close()
                    .offset(-(height * 0.4), 0);
            } else {
                // Range: 0 - 0.028 -> becomes: 0 - 1
                const normalizedProgress = (progress - 0) / (this.cornerWidthRatio - 0);
                const inverseProgress = 1 - normalizedProgress;

                shape
                    .lineStyle(this.lineWidth, this.strokeColor, this.strokeAlpha)
                    .fillStyle(this.fillColor, this.fillAlpha)
                    // @ts-ignore
                    .startAt(left.x - left.x * inverseProgress, left.y)
                    .lineTo(topLeft.x - topLeft.x * inverseProgress, topLeft.y)
                    .lineTo(topRight.x - topRight.x * inverseProgress, topRight.y)
                    .lineTo(right.x - right.x * inverseProgress, right.y)
                    .lineTo(bottomRight.x - bottomRight.x * inverseProgress, bottomRight.y)
                    .lineTo(bottomLeft.x - bottomLeft.x * inverseProgress, bottomLeft.y)
                    .lineTo(left.x - left.x * inverseProgress, left.y)
                    .close()
                    .offset(-(height * 0.4), 0);
            }
            // .offset(-(topLeft.x + topRight.x + width / 2), -(height / 2));
        });
    }

    get cornerWidthRatio() {
        const { topLeft, left } = this.getPoints();
        const cornerWidth = topLeft.x - left.x;
        const cornerWidthRatio = cornerWidth / this.width;
        // console.log("widht", width);
        // console.log("cornerWidth", cornerWidth);
        // console.log("cornerWidthRatio", cornerWidthRatio);

        return cornerWidthRatio;
    }

    getPoints() {
        let left: Point,
            topLeft: Point,
            topRight: Point,
            right: Point,
            bottomRight: Point,
            bottomLeft: Point;
        const { height } = this;

        // left = { x: -0.4 * height, y: 0.6 * height };
        // topLeft = { x: 0 * height, y: 0 * height };
        // topRight = { x: 0 * height, y: 0 * height };
        // right = { x: 0.4 * height, y: 0.6 * height };
        // bottomRight = { x: 0.2 * height, y: 1 * height };
        // bottomLeft = { x: -0.2 * height, y: 1 * height };
        left = { x: 0 * height, y: 0.6 * height };
        topLeft = { x: 0.4 * height, y: 0 * height };
        topRight = { x: 0.4 * height, y: 0 * height };
        right = { x: 0.8 * height, y: 0.6 * height };
        bottomRight = { x: 0.6 * height, y: 1 * height };
        bottomLeft = { x: 0.2 * height, y: 1 * height };

        if (this.flipped) {
            left = this.flip(left, height);
            topLeft = this.flip(topLeft, height);
            topRight = this.flip(topRight, height);
            right = this.flip(right, height);
            bottomRight = this.flip(bottomRight, height);
            bottomLeft = this.flip(bottomLeft, height);
        }

        return { left, topLeft, topRight, right, bottomRight, bottomLeft };
    }

    flip(point: Point, height: number): Point {
        return { x: point.x, y: point.y * -1 + height };
    }

    setProgress(progress: number) {
        // // if (progress <= 0.01)
        // this.subPercentCoef = Math.min(progress * 100, 1);

        // if (progress <= 0.001) this.setVisible(false);
        // else this.setVisible(true);

        this.progress = progress;
        this.setDirty();

        return this;
    }
}
