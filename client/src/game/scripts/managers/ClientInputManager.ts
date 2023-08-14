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
    scene: ClientScene;
    zoom: number;

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

    constructor(scene: ClientScene, player, zoom = 1) {
        super(scene, player);
        this.zoom = zoom;
        scene.cameras.main.startFollow(player);
        scene.cameras.main.setZoom(this.zoom);

        // @ts-ignore
        const scroller: MouseWheelScroller = scene.plugins.get("rexMouseWheelScroller").add(this, {
            speed: 0.001,
        }) as MouseWheelScroller;
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
    }

    initTouchControls() {
        // TODO multitouch
        this.scene.input.addPointer(1);

        const joystick = makeJoystick(this.scene, this.isTouchMode);
        joystick.on("update", () => {
            const force = Math.min(1, Math.floor(joystick.force) / 100);
            const rotationDegree = Math.floor(joystick.angle * 100) / 100;
            this.player.setMove(rotationDegree, force);

            if (!this.player.primaryFireState.autoattack) {
                this.player.rotateTo(Phaser.Math.DegToRad(rotationDegree));
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
    }

    setTargetById(targetId: string) {
        // TODO disable this on client more gracefully
    }
}
