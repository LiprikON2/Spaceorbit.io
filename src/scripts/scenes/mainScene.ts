import Spaceship from "../objects/ship/spaceship";
import InputManager from "../inputManager";
import SoundManager from "../soundManager";

export default class MainScene extends Phaser.Scene {
    inputManager;
    soundManager;
    player;
    background;
    backgroundDict = {};
    screen;
    emitter;
    mobs: Spaceship[] = [];

    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        // Init sound manager
        this.soundManager = new SoundManager(this);

        this.player = new Spaceship(this, 0, 0, "F5S4", this.mobs, 100);
        // Init input manager
        this.inputManager = new InputManager(this, this.player);

        this.soundManager.makeTarget(this.player);
        this.soundManager.addMusic(["track_1", "track_2", "track_3"]);
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            // this.soundManager.playMusic();
        });

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
        this.spawnMobs(20);
    }

    getRandomPositionOnMap() {
        const maxX = this.physics.world.bounds.width;
        const maxY = this.physics.world.bounds.height;
        const randomX = Phaser.Math.Between(0, maxX);
        const randomY = Phaser.Math.Between(0, maxY);

        return { x: randomX, y: randomY };
    }

    update(time, delta) {
        this.inputManager.update(time, delta);
    }
    spawnMobs(count) {
        const mobsToSpawn = count - this.mobs.length;
        for (let i = 0; i < mobsToSpawn; i++) {
            const { x, y } = this.getRandomPositionOnMap();
            const mob = new Spaceship(this, x, y, "F5S4", [this.player]);
            this.mobs.push(mob);
        }
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

        this.physics.world.setBounds(0, 0, boundsSize.width, boundsSize.height);

        this.updateRootBackground(color);
    }

    // https://newdocs.phaser.io/docs/3.54.0/focus/Phaser.GameObjects.Container-setScrollFactor
    // Scrolling factor doesn't adjust the collision boundaries,
    //  so they need to be adjusted manually
    getScrollingFactorCollisionAdjustment(
        parallax,
        textureWidth,
        textureHeight
    ): [
        {
            x: number;
            y: number;
        },
        any
    ] {
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
