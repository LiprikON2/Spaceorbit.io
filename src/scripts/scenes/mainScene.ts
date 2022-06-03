import Spaceship from "../objects/ship/spaceship";
import InputManager from "../inputManager";
import SoundManager from "../soundManager";
import GenericText from "../objects/genericText";
import MobManager from "../mobManager";

export default class MainScene extends Phaser.Scene {
    inputManager;
    soundManager;
    mobManager;
    player;
    background;
    backgroundDict = {};
    screen;
    emitter;
    debugText;
    mobs = [];

    constructor() {
        super({ key: "MainScene" });
    }

    // TODO use polyfill or something to prevent game from stopping requesting animation frames on blur
    create() {
        this.soundManager = new SoundManager(this);
        this.mobManager = new MobManager(this);

        this.player = new Spaceship(
            this,
            400,
            400,
            "F5S4",
            this.getPlayerKit(),
            undefined,
            this.mobManager.mobs,
            100
        );
        // Init input manager
        this.inputManager = new InputManager(this, this.player);

        this.soundManager.makeTarget(this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"], true);

        this.loadBackground("map_1-2", 0.5);
        this.loadTileBackground(
            this,
            this.physics.world.bounds.width,
            this.physics.world.bounds.height,
            "particles",
            0.75
        );
        this.loadTileBackground(
            this,
            this.physics.world.bounds.width,
            this.physics.world.bounds.height,
            "particles",
            1,
            180
        );
        this.debugText = new GenericText(this, this.player).setDepth(1000);
        this.mobManager.spawnMobs(5, [this.player]);

        // Prevents shield from running away when ship hits the world bounds
        this.physics.world.on("worldbounds", (body) => {
            const UUID = body.gameObject.name.length >= 36 ? body.gameObject.name : undefined;
            if (UUID) {
                const collidingShip = this.children.getByName(UUID);
                if (collidingShip) {
                    // @ts-ignore
                    collidingShip.shields.x = collidingShip.x;
                    // @ts-ignore
                    collidingShip.shields.y = collidingShip.y;
                }
            }
        });
    }

    getPlayerKit() {
        return {
            weapons: [
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
                null, // todo change to object with null values
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
            ],
            engines: [null, null],
            inventory: [
                null,
                null,
                null,
                null,
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                { itemName: "engine", itemType: "engines", label: "Eng", color: "yellow" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "gatling", itemType: "weapons", label: "Wpn", color: "red" },
                { itemName: "laser", itemType: "weapons", label: "Wpn", color: "red" },
            ],
        };
    }

    getRandomPositionOnMap(margin = 300) {
        const maxX = this.physics.world.bounds.width;
        const maxY = this.physics.world.bounds.height;
        const randomX = Phaser.Math.Between(margin, maxX - margin);
        const randomY = Phaser.Math.Between(margin, maxY - margin);

        return { x: randomX, y: randomY };
    }

    update(time, delta) {
        this.inputManager.update(time, delta);
        this.debugText.update();
        this.mobManager.update(time, delta);
        this.soundManager.updateLooping();
    }

    updateRootBackground(color?, defaultColor = "#1d252c") {
        const root = document.getElementById("phaser-game");
        root!.style.backgroundColor = color ?? defaultColor;
    }

    // https://blog.ourcade.co/posts/2020/add-pizazz-parallax-scrolling-phaser-3/
    // TODO a way to optimize it further would be to recylcle the tiles
    loadTileBackground = (
        scene: Phaser.Scene,
        totalWidth: number,
        totalHeight: number,
        texture: string,
        scrollFactor: number,
        angle: number = 0
    ) => {
        const { width: w, height: h } = scene.textures.get(texture).getSourceImage();
        const countX = Math.floor(totalWidth / w) * scrollFactor;
        const countY = Math.floor(totalHeight / h) * scrollFactor;

        let y = -h;
        for (let i = 0; i < countY + 3; i++) {
            let x = -w;
            for (let j = 0; j < countX + 3; ++j) {
                const m = scene.add
                    .image(x, y, texture)
                    .setOrigin(0, 1)
                    .setScrollFactor(scrollFactor)
                    .setAngle(angle);

                x += m.width;
            }
            y += scene.scale.height;
        }
    };

    loadBackground(atlasTexture: string, parallax: number) {
        const atlas = this.textures.get(atlasTexture);
        const width = atlas.frames["map"].width;
        const height = atlas.frames["map"].height;
        const color = atlas.customData["meta"].bgColor;

        const [imageOffset, boundsSize] = this.getScrollingFactorCollisionAdjustment(
            parallax,
            width,
            height
        );

        this.add
            .image(imageOffset.x, imageOffset.y, atlasTexture)
            .setOrigin(0, 0)
            .setScrollFactor(parallax);

        // TODO solve magic numbers
        this.physics.world.setBounds(0, 0, boundsSize.width - 500, boundsSize.height - 700);

        this.updateRootBackground(color);
    }

    // https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.GameObjects.Container-setScrollFactor
    // Scrolling factor doesn't adjust the collision boundaries,
    // so they need to be adjusted manually
    getScrollingFactorCollisionAdjustment(
        parallax,
        textureWidth,
        textureHeight
    ): [{ x: number; y: number }, { width: number; height: number }] {
        var csx = this.cameras.main.scrollX;
        var csy = this.cameras.main.scrollY;

        var px = 0 + csx * parallax - csx;
        var py = 0 + csy * parallax - csy;

        const imageOffset: { x: number; y: number } = { x: px, y: py };
        const boundsSize: { width: number; height: number } = {
            width: (textureWidth * 1) / parallax,
            height: (textureHeight * 1) / parallax,
        };
        return [imageOffset, boundsSize];
    }
}
