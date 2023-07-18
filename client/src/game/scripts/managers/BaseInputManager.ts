import type { Spaceship } from "~/objects/ship/Spaceship";
import type { BaseScene } from "~/scenes/core/BaseScene";

export interface Keys {
    [key: string]: Phaser.Input.Keyboard.Key;
}

export interface Actions {
    up: boolean;
    right: boolean;
    down: boolean;
    left: boolean;
    primaryFire: boolean;
    secondaryFire: boolean;
    touchMode: boolean;
    autoattack: boolean;
    targetId: string | null;
    worldX: number | null;
    worldY: number | null;
}

const defaultActions = {
    worldX: null,
    worldY: null,

    up: false,
    right: false,
    down: false,
    left: false,

    primaryFire: false,
    secondaryFire: false,

    touchMode: false,
    autoattack: false,
    targetId: null,
};

export default class BaseInputManager {
    scene: BaseScene;
    player: Spaceship;
    keys: Keys;
    isTouchMode = false;
    _actions: Actions;

    get actions(): Actions {
        return this._actions;
    }

    /**
     * Returns action object without keys which have default values
     */
    get actionsCompact(): Partial<Actions> {
        const actionsCompactEntries = Object.entries(this.actions).filter(
            ([key, value]) => value !== defaultActions[key]
        );
        const actionsCompact = Object.fromEntries(actionsCompactEntries) as Actions;
        return actionsCompact;
    }
    setActions(actions: Partial<Actions>) {
        this._actions = { ...defaultActions, ...actions };
    }

    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this._actions = defaultActions;
    }

    getPointerPosition() {
        // Updates mouse worldX, worldY manually, since when camera moves,
        // but cursor doesn't it doesn't update them
        this.scene.input.activePointer.updateWorldPoint(this.scene.cameras.main);

        const { worldX, worldY } = this.scene.input.activePointer;
        return { worldX, worldY };
    }

    update(time: number, delta: number) {
        const { up, left, down, right, primaryFire, autoattack, worldX, worldY } = this.actions;
        let moved = false;

        this.player.resetMovement();
        moved = this.player.move();

        // Movement
        if (up && !left && !down && !right) {
            this.player.moveUp();
            moved = true;
        } else if (!up && left && !down && !right) {
            this.player.moveLeft();
            moved = true;
        } else if (!up && !left && down && !right) {
            this.player.moveDown();
            moved = true;
        } else if (!up && !left && !down && right) {
            this.player.moveRight();
            moved = true;
        } else if (up && left && !down && !right) {
            this.player.moveUpLeft();
            moved = true;
        } else if (up && !left && !down && right) {
            this.player.moveUpRight();
            moved = true;
        } else if (!up && left && down && !right) {
            this.player.moveDownLeft();
            moved = true;
        } else if (!up && !left && down && right) {
            this.player.moveDownRight();
            moved = true;
        }
        if (!moved) this.player.onStopMoving();

        // Shooting
        if (primaryFire && !autoattack) {
            this.player.primaryFire(time, { worldX, worldY });
        } else if (autoattack) {
            const dist = Phaser.Math.Distance.BetweenPoints(this.player, this.player.target);
            if (dist < 900) {
                this.player.primaryFire(time, { worldX, worldY });
            }
        }

        // Aiming
        if (worldX && worldY) this.player.lookAtPoint(worldX, worldY);
    }
}
