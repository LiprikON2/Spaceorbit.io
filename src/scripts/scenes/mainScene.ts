import Spaceship from "../objects/spaceship";
import GenericText from "../objects/genericText";

export default class MainScene extends Phaser.Scene {
    debugText: GenericText;
    player;
    background;
    keys;
    debugTextDict = {};
    backgroundDict = {};
    screen;
    emitter;
    zoom = 1;
    enemies;
    musicPlaylist = ["track_1", "track_2", "track_3"];
    music;
    constructor() {
        super({ key: "MainScene" });
    }

    create() {
        // Init keys
        this.keys = this.input.keyboard.addKeys("W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT");

        this.enemies = [new Spaceship(this, 1000, 1000, "F5S4")];
        this.player = new Spaceship(this, 0, 0, "F5S4", this.enemies);

        this.cameras.main.startFollow(this.player);
        this.debugText = new GenericText(this, this.player).setDepth(100);
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

        this.sound.pauseOnBlur = false;
        this.playMusicPlaylist(-1);

        // Make player look at the cursor
        this.input.on("pointermove", (event) => {
            this.player.lookAtPoint(event.worldX, event.worldY);
        });

        this.cameras.main.setZoom(this.zoom);

        // @ts-ignore
        const scroller = this.plugins.get("rexMouseWheelScroller").add(this, {
            speed: 0.001,
        });
        scroller.on("scroll", (inc, gameObject, scroller) => {
            this.zoom -= inc;
            // Enforce min zoom
            this.zoom = Math.max(this.zoom, 0.1);
            // Snap to normal zoom
            if (Math.abs(this.zoom - 1) < 0.08) {
                this.zoom = 1;
            }
            this.cameras.main.setZoom(this.zoom);
        });
    }

    update(time, delta) {
        this.debugText.update();

        this.player.resetMovement();

        // Key bindings
        const upBtn = this.keys.W.isDown || this.keys.UP.isDown;
        const leftBtn = this.keys.A.isDown || this.keys.LEFT.isDown;
        const rightBtn = this.keys.D.isDown || this.keys.RIGHT.isDown;
        const downBtn = this.keys.S.isDown || this.keys.DOWN.isDown;
        const primaryShootBtn = this.input.activePointer.isDown;

        let hasMoved = false;
        // Movement
        if (upBtn && !leftBtn && !downBtn && !rightBtn) {
            this.player.moveUp();
            hasMoved = true;
        } else if (!upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveLeft();
            hasMoved = true;
        } else if (!upBtn && !leftBtn && downBtn && !rightBtn) {
            this.player.moveDown();
            hasMoved = true;
        } else if (!upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveRight();
            hasMoved = true;
        } else if (upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveUpLeft();
            hasMoved = true;
        } else if (upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveUpRight();
            hasMoved = true;
        } else if (!upBtn && leftBtn && downBtn && !rightBtn) {
            this.player.moveDownLeft();
            hasMoved = true;
        } else if (!upBtn && !leftBtn && downBtn && rightBtn) {
            this.player.moveDownRight();
            hasMoved = true;
        }
        if (!hasMoved) this.player.stoppedMoving();

        // Shooting
        if (primaryShootBtn) {
            this.player.primaryFire(time);
        }
    }

    playMusicPlaylist(trackIndex) {
        if (trackIndex === -1) {
            // Play random track
            trackIndex = Phaser.Math.Between(0, this.musicPlaylist.length - 1);
        }
        this.music = this.sound.add(this.musicPlaylist[trackIndex]);
        this.music.play({ volume: 0.1 });

        // Play the next track in a playlist, once finished with this one
        this.music.on("complete", () => {
            const nextTrackIndex = (trackIndex + 1) % this.musicPlaylist.length;
            this.playMusicPlaylist(nextTrackIndex);
        });
    }

    updateRootBackground(color?) {
        const root = document.getElementById("phaser-game");
        root!.style.backgroundColor = color ?? "#1d252c";
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
