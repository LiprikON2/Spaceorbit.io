import type MouseWheelScroller from "phaser3-rex-plugins/plugins/mousewheelscroller";
import type RexVirtualJoyStick from "phaser3-rex-plugins/plugins/virtualjoystick";

type VirtualJoyStick = RexVirtualJoyStick & Phaser.Events.EventEmitter;

export default class InputManager {
    scene;
    player;
    keys;
    zoom;
    time = 0;
    frameTime = 0;
    touchControls = { joystick: null, virtualBtn: null };
    isTouchMode = false;

    constructor(scene, player, zoom = 1) {
        const localStorageSettings = scene.game.settings;
        const { isTouchMode } = localStorageSettings;
        this.isTouchMode = isTouchMode ?? this.isTouchMode;

        this.scene = scene;
        this.player = player;
        this.zoom = zoom;
        this.keys = scene.input.keyboard.addKeys("W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT");

        scene.cameras.main.startFollow(player);
        scene.cameras.main.setZoom(this.zoom);

        const scroller: MouseWheelScroller = scene.plugins.get("rexMouseWheelScroller").add(this, {
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

        this.scene.input.on("clickTarget", (target) => this.player.setTarget(target));

        // TODO fix CTRL
        // const toggleShootTargetBtn = this.keys.CTRL;
        const toggleShootTargetBtn = this.keys.SPACE;

        toggleShootTargetBtn.on("down", () => this.player.toggleAttack());

        this.initTouchControls();
    }
    initTouchControls() {
        const baseJoystick = this.scene.add.image(0, 0, "joystick_1").setDepth(1000);
        const thumbJoystick = this.scene.add.image(0, 0, "joystick_2").setDepth(1000);
        const thumbBtn = this.scene.add.image(0, 0, "joystick_2").setDepth(1000);

        // TODO multitouch
        this.scene.input.addPointer(1);
        const joystick: VirtualJoyStick = this.scene.plugins
            .get("rexVirtualJoystick")
            .add(this.scene, {
                x: Number(this.scene.game.config.height) * 0.25,
                y:
                    Number(this.scene.game.config.height) -
                    Number(this.scene.game.config.height) * 0.25,
                radius: 100,
                base: baseJoystick,
                thumb: thumbJoystick,
                enable: this.isTouchMode,
                fixed: true,
            });
        joystick.setVisible(this.isTouchMode);

        joystick.on("update", () => {
            const force = Math.min(1, Math.floor(joystick.force) / 100);
            const rotationDegree = Math.floor(joystick.angle * 100) / 100;
            this.player.setMove(rotationDegree, force);
            if (!this.player.toggleFire) {
                this.player.rotateTo(Phaser.Math.DegToRad(rotationDegree + 90));
            }
        });

        this.touchControls.joystick = joystick;

        const virtualBtn: VirtualJoyStick = this.scene.plugins
            .get("rexVirtualJoystick")
            .add(this.scene, {
                x: Number(this.scene.game.config.width) * 0.75,
                y:
                    Number(this.scene.game.config.height) -
                    Number(this.scene.game.config.height) * 0.25,
                radius: 100,
                base: this.scene.add.rectangle(-999, -999),
                thumb: thumbBtn,
                enable: false,
                fixed: true,
            });
        virtualBtn.setVisible(this.isTouchMode);

        // @ts-ignore
        virtualBtn.on("pointerdown", () => this.player.toggleAttack());
        this.touchControls.virtualBtn = virtualBtn;
    }
    toggleTouchControls() {
        const { joystick, virtualBtn } = this.touchControls;
        if (joystick) {
            // @ts-ignore
            joystick.toggleVisible();
            // @ts-ignore
            joystick.toggleEnable();
        }
        if (virtualBtn) {
            // @ts-ignore
            virtualBtn.toggleVisible();
        }

        this.isTouchMode = !this.isTouchMode;
    }

    getPointerPosition() {
        // Updates mouse worldX, worldY manually, since when camera moves but cursor doesn't it doesn't update them
        this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);
        const cursorX = this.scene.input.activePointer.worldX;
        const cursorY = this.scene.input.activePointer.worldY;

        // console.log("cursorX, cursorY", cursorX, cursorY);

        return { cursorX, cursorY };
    }

    update(time, delta) {
        this.frameTime += delta;
        this.time = time;

        // Key bindings
        const upBtn = this.keys.W.isDown || this.keys.UP.isDown;
        const leftBtn = this.keys.A.isDown || this.keys.LEFT.isDown;
        const rightBtn = this.keys.D.isDown || this.keys.RIGHT.isDown;
        const downBtn = this.keys.S.isDown || this.keys.DOWN.isDown;
        const primaryShootBtn = this.scene.input.activePointer.isDown;

        const isClickInCanvas =
            primaryShootBtn && this.scene.input.activePointer.downElement.tagName === "CANVAS";
        const isAutotargeting = this.player.toggleFire && this.player.target;

        // Targeting
        let cursorX, cursorY;
        if (isAutotargeting) {
            const { x, y } = this.player.target;
            cursorX = x;
            cursorY = y;
        } else if (!this.isTouchMode) {
            // Don't track cursor if in touch mode
            ({ cursorX, cursorY } = this.getPointerPosition());
        }

        let haveMoved = false;

        this.player.resetMovement();
        haveMoved = this.player.move();

        // Movement
        if (upBtn && !leftBtn && !downBtn && !rightBtn) {
            this.player.moveUp();
            haveMoved = true;
        } else if (!upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveLeft();
            haveMoved = true;
        } else if (!upBtn && !leftBtn && downBtn && !rightBtn) {
            this.player.moveDown();
            haveMoved = true;
        } else if (!upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveRight();
            haveMoved = true;
        } else if (upBtn && leftBtn && !downBtn && !rightBtn) {
            this.player.moveUpLeft();
            haveMoved = true;
        } else if (upBtn && !leftBtn && !downBtn && rightBtn) {
            this.player.moveUpRight();
            haveMoved = true;
        } else if (!upBtn && leftBtn && downBtn && !rightBtn) {
            this.player.moveDownLeft();
            haveMoved = true;
        } else if (!upBtn && !leftBtn && downBtn && rightBtn) {
            this.player.moveDownRight();
            haveMoved = true;
        }
        if (!haveMoved) this.player.onStopMoving();

        // Shooting
        if (isClickInCanvas) {
            this.player.primaryFire(time, { cursorX, cursorY });
        } else if (isAutotargeting) {
            const dist = Phaser.Math.Distance.BetweenPoints(this.player, this.player.target);
            if (dist < 900) {
                this.player.primaryFire(time, { cursorX, cursorY });
            }
        }
        if (cursorX && cursorY) this.player.lookAtPoint(cursorX, cursorY);
    }
}
