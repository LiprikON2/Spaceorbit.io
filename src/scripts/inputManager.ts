let held = false;

export default class InputManager {
    scene;
    player;
    keys;
    zoom;
    temp;
    heldKeys = {};
    time = 0;
    constructor(scene, player, zoom = 1) {
        this.scene = scene;
        this.player = player;
        this.zoom = zoom;
        this.keys = scene.input.keyboard.addKeys("W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT");

        scene.cameras.main.startFollow(player);
        scene.cameras.main.setZoom(this.zoom);

        // Make player look at the cursor
        scene.input.on("pointermove", (event) => {
            player.lookAtPoint(event.worldX, event.worldY);
        });

        // @ts-ignore
        const scroller = scene.plugins.get("rexMouseWheelScroller").add(this, {
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
            scene.cameras.main.setZoom(this.zoom);
        });

        const secondaryShootBtn = this.keys.SPACE;
        secondaryShootBtn.on("down", () => {
            this.scene.enemies[0].primaryFire(this.time);
        });
    }

    isHeld(key) {
        if (!this.heldKeys[key]) {
            this.heldKeys = key.isUp;
        }
    }

    update(time) {
        this.time = time;
        this.player.resetMovement();

        // Key bindings
        const upBtn = this.keys.W.isDown || this.keys.UP.isDown;
        const leftBtn = this.keys.A.isDown || this.keys.LEFT.isDown;
        const rightBtn = this.keys.D.isDown || this.keys.RIGHT.isDown;
        const downBtn = this.keys.S.isDown || this.keys.DOWN.isDown;
        const primaryShootBtn = this.scene.input.activePointer.isDown;

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
}
