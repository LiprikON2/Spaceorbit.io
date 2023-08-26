import { action, makeObservable, observable } from "mobx";
import type MouseWheelScroller from "phaser3-rex-plugins/plugins/mousewheelscroller";
import type RexVirtualJoyStick from "phaser3-rex-plugins/plugins/virtualjoystick";

import type { ClientScene } from "~/scenes/core/ClientScene";
import { GameClient } from "~/game/core/client/GameClient";
import BaseInputManager, { type Keys, type Actions } from "./BaseInputManager";

type VirtualJoyStick = RexVirtualJoyStick & Phaser.Events.EventEmitter;

const makeJoystick = (scene, enable) => {
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
};
const makeButton = (scene, enable) => {
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
};

export class ClientInputManager extends BaseInputManager {
    touchControls = { joystick: null, virtualBtn: null };
    declare scene: ClientScene;
    zoom = 1;
    toFollowCursor = false;

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

            touchMode: this.isTouchMode,
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

    constructor(scene: ClientScene, player) {
        super(scene, player);
        scene.cameras.main.startFollow(player, false);
        const { toFollowCursor } = scene.game.settings;
        this.setFollowCursor(toFollowCursor);

        this.updateZoom();

        // @ts-ignore
        const scroller: MouseWheelScroller = scene.plugins.get("rexMouseWheelScroller").add(this, {
            speed: 0.001,
        }) as MouseWheelScroller;
        scroller.on("scroll", (diff, gameObject, scroller) => this.updateZoom(diff));
        this.scene.scale.on("resize", (gameSize, baseSize, displaySize) => this.updateZoom());

        if (this.scene.game instanceof GameClient) {
            const isTouchMode = this.scene.game.settings?.localStorageSettings?.isTouchMode;
            this.isTouchMode = isTouchMode ?? this.isTouchMode;
        }

        this.keys = this.scene.input.keyboard.addKeys(
            "W,A,S,D,SPACE,CTRL,UP,LEFT,DOWN,RIGHT"
        ) as Keys;

        this.scene.input.on("clickTarget", (target) => this.player.setTarget(target));

        const toggleShootTargetBtn = this.keys.SPACE;
        toggleShootTargetBtn.on("down", () => this.player.toggleAutoattack());

        this.initTouchControls();
        makeObservable(this, {
            toFollowCursor: observable,
            setFollowCursor: action,
        });
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

        const joystick = makeJoystick(this.scene, this.isTouchMode);
        joystick.on("update", () => {
            const accelerationPercentage = Math.min(1, Math.floor(joystick.force) / 100);
            const rotation = Phaser.Math.DegToRad(Math.floor(joystick.angle * 100) / 100);
            this.player.setThrust(rotation, accelerationPercentage);

            if (!this.player.primaryFireState.autoattack) {
                this.player.rotateTo(Phaser.Math.DegToRad(rotation));
            }
        });

        const virtualBtn = makeButton(this.scene, this.isTouchMode);
        virtualBtn.on("pointerdown", () => this.player.toggleAutoattack());

        this.touchControls = { joystick, virtualBtn };
    }

    toggleTouchControls() {
        const { joystick, virtualBtn } = this.touchControls;
        if (joystick) {
            joystick.toggleVisible();
            joystick.toggleEnable();
        }
        if (virtualBtn) {
            virtualBtn.toggleVisible();
        }

        this.isTouchMode = !this.isTouchMode;
    }

    update(time: number, delta: number) {
        super.update(time, delta);
        if (this.toFollowCursor) this.makeCameraFollowCursor();
    }

    setFollowCursor(enable = true, lerp = 0.3) {
        this.toFollowCursor = enable;
        if (enable) this.scene.cameras.main.setLerp(lerp);
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
}
