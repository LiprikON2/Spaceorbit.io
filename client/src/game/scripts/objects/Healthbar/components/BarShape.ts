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

        // window["test"] = this;

        this.setUpdateShapesCallback(() => {
            const shape = this.getShapes()[0] as Lines;
            shape
                .lineStyle(this.lineWidth, this.strokeColor, this.strokeAlpha)
                .fillStyle(this.fillColor, this.fillAlpha);

            if (this.isSixSided) this.#makeShapeSixSided(shape);
            else if (this.isFiveSided) this.#makeShapeFiveSided(shape);
            else if (this.isFourSided) this.#makeShapeFourSided(shape);
        });
    }

    get sixSidedProgress() {
        // Progress: 0.028 - 1 -> becomes: 0 - 1
        return (this.progress - this.cornerWidthRatio) / (1 - this.cornerWidthRatio);
    }

    get fiveSidedOrLessProgress() {
        // Progress: 0 - 0.028 -> becomes: 0 - 1
        return this.progress / this.cornerWidthRatio;
    }
    /**
     * Inversed five sided or less progress
     */
    get invFiveSidedOrLessProgress() {
        return 1 - this.fiveSidedOrLessProgress;
    }

    get isSixSided() {
        return this.progress > this.cornerWidthRatio;
    }
    get isFiveSided() {
        const { topLeft, topRight, right, bottomRight, bottomLeft } = this.getPoints();

        const topRightX = topRight.x - right.x * this.invFiveSidedOrLessProgress;
        const bottomRightX = bottomRight.x - right.x * this.invFiveSidedOrLessProgress;

        return topLeft.x >= topRightX && bottomLeft.x < bottomRightX;
    }
    get isFourSided() {
        return !this.isFiveSided && !this.isSixSided;
    }

    #makeShapeSixSided(shape: Lines) {
        const { left, topLeft, topRight, right, bottomRight, bottomLeft } = this.getPoints();

        const progressWidth = this.width * this.sixSidedProgress;

        shape
            // @ts-ignore
            .startAt(left.x, left.y)
            .lineTo(topLeft.x, topLeft.y)
            .lineTo(topRight.x + progressWidth, topRight.y)
            .lineTo(right.x + progressWidth, right.y)
            .lineTo(bottomRight.x + progressWidth, bottomRight.y)
            .lineTo(bottomLeft.x, bottomLeft.y)
            .lineTo(left.x, left.y)
            .close()
            .offset(-topLeft.x, 0);

        return shape;
    }

    #makeShapeFiveSided(shape: Lines) {
        const { left, topLeft, topRight, right, bottomRight, bottomLeft } = this.getPoints();

        const topRightX = topRight.x - right.x * this.invFiveSidedOrLessProgress;
        const rightX = right.x - right.x * this.invFiveSidedOrLessProgress;
        const bottomRightX = bottomRight.x - right.x * this.invFiveSidedOrLessProgress;

        const topIntersec = this.#getTopIntersection(rightX, topRightX);
        const bottomIntersec = this.#getBottomIntersection(rightX, bottomRightX);

        shape
            // @ts-ignore
            .startAt(left.x, left.y)
            .lineTo(topIntersec?.x ?? topRightX, topIntersec?.y ?? topRight.y)
            .lineTo(rightX, right.y)
            .lineTo(bottomRightX, bottomIntersec?.y ?? bottomRight.y)
            .lineTo(bottomIntersec?.x ?? bottomLeft.x, bottomIntersec?.y ?? bottomLeft.y)
            .lineTo(left.x, left.y)
            .close()
            .offset(-topLeft.x, 0);
    }

    #makeShapeFourSided(shape: Lines) {
        const { left, topLeft, topRight, right, bottomRight } = this.getPoints();

        const topRightX = topRight.x - right.x * this.invFiveSidedOrLessProgress;
        const rightX = right.x - right.x * this.invFiveSidedOrLessProgress;
        const bottomRightX = bottomRight.x - right.x * this.invFiveSidedOrLessProgress;

        const topIntersec = this.#getTopIntersection(rightX, topRightX);
        const bottomIntersec = this.#getBottomIntersection(rightX, bottomRightX);

        shape
            // @ts-ignore
            .startAt(left.x, left.y)
            .lineTo(topIntersec?.x ?? topRightX, topIntersec?.y ?? topRight.y)
            .lineTo(rightX, right.y)
            .lineTo(bottomIntersec?.x ?? bottomRightX, bottomIntersec?.y ?? bottomRight.y)
            .lineTo(left.x, left.y)
            .close()
            .offset(-topLeft.x, 0);
    }

    #getTopIntersection(rightX: number, topRightX: number) {
        const { left, topLeft, topRight, right } = this.getPoints();

        const topIntersec = Phaser.Geom.Intersects.GetLineToLine(
            new Phaser.Geom.Line(left.x, left.y, topLeft.x, topLeft.y),
            new Phaser.Geom.Line(rightX, right.y, topRightX, topRight.y)
        );

        return topIntersec;
    }

    #getBottomIntersection(rightX: number, bottomRightX: number) {
        const { left, right, bottomRight, bottomLeft } = this.getPoints();

        const bottomIntersec = Phaser.Geom.Intersects.GetLineToLine(
            new Phaser.Geom.Line(left.x, left.y, bottomLeft.x, bottomLeft.y),
            new Phaser.Geom.Line(rightX, right.y, bottomRightX, bottomRight.y)
        );
        return bottomIntersec;
    }

    /**
     * Ratio, after which, the bar becomes 6 -> 5 sided
     */
    get cornerWidthRatio() {
        const { topLeft, left } = this.getPoints();
        const cornerWidth = topLeft.x - left.x;
        const cornerWidthRatio = cornerWidth / this.width;

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
        this.progress = progress;
        this.setDirty();

        return this;
    }
}
