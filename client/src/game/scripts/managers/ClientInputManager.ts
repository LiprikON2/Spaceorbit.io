import type MouseWheelScroller from "phaser3-rex-plugins/plugins/mousewheelscroller";
import type RexVirtualJoyStick from "phaser3-rex-plugins/plugins/virtualjoystick";
import { Mixin, settings } from "ts-mixer";
settings.initFunction = "init";

import type { ClientScene } from "~/scenes/core/ClientScene";
import BaseInputManager, { type Keys, type Actions } from "./BaseInputManager";
import { Reactive } from "./components";

type VirtualJoyStick = RexVirtualJoyStick & Phaser.Events.EventEmitter;

interface ClientInputManager extends BaseInputManager {}
class ClientInputManager extends Mixin(BaseInputManager, Reactive) {
    touchControls: { joystick: VirtualJoyStick; virtualBtn: VirtualJoyStick } = {
        joystick: null,
        virtualBtn: null,
    };
    declare scene: ClientScene;
    zoom = 1;

    get baseZoom() {
        const coef = 0.75;
        return (this.scene.scale.baseSize.width / 1920) * coef;
    }

    get isGameInFocus() {
        return this.scene.input.activePointer.downElement?.tagName === "CANVAS";
    }
    get targetId() {
        return this.player?.target?.id ?? null;
    }

    get actions(): Required<Actions> {
        const { worldX, worldY } = this.getPointerPosition();

        return {
            worldX,
            worldY,

            up: this.keys.W.isDown || this.keys.UP.isDown,
            right: this.keys.D.isDown || this.keys.RIGHT.isDown,
            down: this.keys.S.isDown || this.keys.DOWN.isDown,
            left: this.keys.A.isDown || this.keys.LEFT.isDown,

            primaryFire: this.isGameInFocus && this.scene.input.activePointer.isDown,
            secondaryFire: false,

            touchMode: this.touchMode,
            autoattack: this.player.isAutoattacking,
            targetId: this.targetId,
        };
    }

    getPointerPosition() {
        // Updates mouse worldX, worldY manually, since when camera moves,
        // but cursor doesn't it doesn't update them
        this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);

        const { worldX, worldY } = this.scene.input.activePointer;
        return { worldX, worldY };
    }

    get toFollowCursor() {
        return this.scene.game.settings.toFollowCursor;
    }
    get touchMode() {
        return this.scene.game.settings.touchMode;
    }

    constructor(scene: ClientScene, player) {
        super(scene, player);
        scene.cameras.main.startFollow(player, false);
        this.updateZoom();

        const scroller: MouseWheelScroller = this.scene.plugins
            .get("rexMouseWheelScroller")
            // @ts-ignore
            .add(this, {
                speed: 0.001,
            }) as MouseWheelScroller;
        scroller.on("scroll", (diff) => this.updateZoom(diff));
        this.scene.scale.on("resize", () => this.updateZoom());

        this.keys = this.scene.input.keyboard.addKeys(
            "W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT"
        ) as Keys;

        this.scene.input.on("entity:targeted", (target) => this.player.setTarget(target));

        const toggleShootTargetBtn = this.keys.SPACE;
        toggleShootTargetBtn.on("down", () => this.player.toggleAutoattack());
    }

    // https://github.com/tannerntannern/ts-mixer#dealing-with-constructors
    init() {
        this.initTouchControls();
        this.reaction(
            () => this.toFollowCursor,
            () => this.updateFollowCursor(),
            { fireImmediately: true }
        );
        this.reaction(
            () => this.touchMode,
            () => this.updateTouchMode(),
            { fireImmediately: true }
        );
    }

    updateZoom(diff = 0) {
        this.zoom -= diff;

        // Enforce min zoom
        this.zoom = Math.max(this.zoom, 0.1);
        // Snap to normal zoom
        if (Math.abs(this.zoom - 1) < 0.08) {
            this.zoom = 1;
        }
        const scaledZoom = this.baseZoom * this.zoom;

        this.scene.cameras.main.setZoom(scaledZoom);

        // this.scene.resize(this.scene.background, 1 / this.zoom);
    }

    initTouchControls() {
        // TODO multitouch
        this.scene.input.addPointer(1);

        const joystick = ClientInputManager.makeJoystick(this.scene, this.touchMode);
        joystick.on("update", () => {
            const accelerationPercentage = Math.min(1, Math.floor(joystick.force) / 100);
            const rotation = Phaser.Math.DegToRad(Math.floor(joystick.angle * 100) / 100);
            this.player.setThrust(rotation, accelerationPercentage);

            if (!this.player.primaryFireState.autoattack) {
                this.player.rotateTo(Phaser.Math.DegToRad(rotation));
            }
        });

        const virtualBtn = ClientInputManager.makeButton(this.scene, this.touchMode);
        virtualBtn.on("pointerdown", () => this.player.toggleAutoattack());

        this.touchControls = { joystick, virtualBtn };
    }

    updateTouchMode() {
        const { joystick, virtualBtn } = this.touchControls;
        if (joystick) {
            joystick.setVisible(this.touchMode);
            joystick.setEnable(this.touchMode);
        }
        if (virtualBtn) {
            virtualBtn.setVisible(this.touchMode);
        }
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if (this.scene.game.settings.toFollowCursor) this.makeCameraFollowCursor();
    }

    updateFollowCursor(lerp = 0.3) {
        if (this.toFollowCursor) this.scene.cameras.main.setLerp(lerp);
        else this.scene.cameras.main.setLerp(1).setFollowOffset(0);
    }

    makeCameraFollowCursor(minDistancePercentage = 0.5, maxOffset = 250) {
        const { x, y } = this.player;
        const { worldX, worldY } = this.player.pointer;

        const diffX = x - worldX;
        const diffY = y - worldY;

        const visibleWorldWidth = this.scene.scale.displaySize.width * (1 / this.baseZoom);
        const visibleWorldHeight = this.scene.scale.displaySize.height * (1 / this.baseZoom);

        const maxDistanceX = visibleWorldWidth / 2 + maxOffset * 2;
        const minDistanceX = (visibleWorldWidth / 2) * minDistancePercentage;

        const maxDistanceY = visibleWorldHeight / 2 + maxOffset * 2;
        const minDistanceY = (visibleWorldHeight / 2) * minDistancePercentage;

        const normalizeX = Phaser.Math.Clamp(
            (Math.abs(diffX) - minDistanceX) / (maxDistanceX - minDistanceX),
            0,
            1
        );
        const normalizeY = Phaser.Math.Clamp(
            (Math.abs(diffY) - minDistanceY) / (maxDistanceY - minDistanceY),
            0,
            1
        );

        const offsetX = Math.sign(diffX) * normalizeX * maxOffset;
        const offsetY = Math.sign(diffY) * normalizeY * maxOffset;

        this.scene.cameras.main.setFollowOffset(offsetX, offsetY);
    }

    setTargetById(targetId: string) {
        // TODO disable this on client more gracefully
    }

    static makeJoystick(scene: Phaser.Scene, enable: boolean) {
        const baseJoystick = scene.add.image(0, 0, "joystick_1").setDepth(1000);
        const thumbJoystick = scene.add.image(0, 0, "joystick_2").setDepth(1000);

        const joystick: VirtualJoyStick = scene.plugins
            .get("rexVirtualJoystick")
            // @ts-ignore
            .add(scene, {
                x: Number(scene.game.config.height) * 0.25,
                y: Number(scene.game.config.height) - Number(scene.game.config.height) * 0.25,
                radius: 100,
                base: baseJoystick,
                thumb: thumbJoystick,
                enable,
                fixed: true,
            });
        joystick.setVisible(enable);

        return joystick;
    }
    static makeButton(scene: Phaser.Scene, enable: boolean) {
        const thumbBtn = scene.add.image(0, 0, "joystick_2").setDepth(1000);
        const virtualBtn: VirtualJoyStick = scene.plugins
            .get("rexVirtualJoystick")
            // @ts-ignore
            .add(scene, {
                x: Number(scene.game.config.width) * 0.75,
                y: Number(scene.game.config.height) - Number(scene.game.config.height) * 0.25,
                radius: 100,
                base: scene.add.rectangle(-999, -999),
                thumb: thumbBtn,
                enable: false,
                fixed: true,
            });
        virtualBtn.setVisible(enable);

        return virtualBtn;
    }
}

export { ClientInputManager };
