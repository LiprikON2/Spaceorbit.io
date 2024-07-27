import type ContainerLite from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/ContainerLite";
import type RotateTo from "phaser3-rex-plugins/plugins/rotateto";
import type MoveTo from "phaser3-rex-plugins/plugins/moveto";

import {
    Explosion,
    Exhausts,
    Weapons,
    Shields,
    Outfitting,
    type Outfit,
    Pilot,
    type PilotServerOptions,
} from "./components";
import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "../Sprite";
import type { ProjectileGroup, SpaceshipGroup } from "~/managers/BaseEntityManager";
import { Status, type StatusState } from "./components/Status/Status";

export enum AllegianceEnum {
    // AlienNeutral = "AlienNeutral",
    // AlienHostile = "AlienHostile",
    Unaffiliated = "Unaffiliated",
    Alien = "Alien",
    Venus = "Venus",
    Mars = "Mars",
    Earth = "Earth",
}
export type AllegianceKeys = keyof typeof AllegianceEnum;

interface MovementVector {
    rotation: number;
    magnitude: number;
    accelerationMultiplier: number;
}

type AllegianceOpposition = {
    [key in AllegianceKeys]: AllegianceKeys[];
};

type MovementActivity = "moving" | "stopped";

export interface Reward {
    exp: number;
    currency: number;
}

export type ActionsState = {
    id: string;
    groupName: "mob" | "players";
    x: number;
    y: number;
    angle: number;
    activity: MovementActivity;
    worldX: number;
    worldY: number;
    primaryFireAutoattack: 0 | 1;
    primaryFireActive: 0 | 1;
    targetId: string | undefined;
    hidden: 0 | 1;
    intangible: 0 | 1;
};

export interface Multipliers {
    speed: number;
    hullHp: number;
    shieldsHp: number;
    damage: number;
    hullRegen?: number;
    shieldsRegen?: number;
}

export interface SpaceshipServerOptions extends SpriteServerOptions {
    id: string;
    outfit: Outfit;
    allegiance: AllegianceEnum | AllegianceKeys;
    multipliers: Multipliers;
    username: string;
    attackerReward: Reward;
    pilotServerOptions?: PilotServerOptions;
}

export interface SpaceshipClientOptions extends SpriteClientOptions {
    projectileGroup: ProjectileGroup;
}

export interface WeaponOrigin {
    x: number;
    y: number;
    variation: string;
}

interface ExhaustOrigin {
    x: number;
    y: number;
}

export class Spaceship extends Sprite {
    declare id: string;
    modules: {
        exhaustOrigins: ExhaustOrigin[];
        weaponOrigins: WeaponOrigin[];
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    #thrust: { rotation: number; velocityPercentage: number } = {
        rotation: 0,
        velocityPercentage: 0,
    };

    outfitting: Outfitting;

    status: Status;
    pilot: Pilot;
    baseStats: { hullHp: number; hitboxRadius: number; speed: number };

    target: Spaceship | null;
    targetedBy: Spaceship[] = [];
    projectileGroup: ProjectileGroup;

    allegiance: AllegianceEnum | AllegianceKeys;
    staticBox: ContainerLite & { body: Phaser.Physics.Arcade.Body };
    rotatingBox: ContainerLite & { body: Phaser.Physics.Arcade.Body };
    rotateToPlugin: RotateTo;
    moveToPlugin: MoveTo;

    #pointer: { worldX: number; worldY: number };
    primaryFireState = { active: false, autoattack: false };

    static allegianceOpposition: AllegianceOpposition = {
        Unaffiliated: ["Unaffiliated", "Alien", "Venus", "Mars", "Earth"],
        Alien: ["Unaffiliated", "Venus", "Mars", "Earth"],
        Venus: ["Unaffiliated", "Alien", "Mars", "Earth"],
        Mars: ["Unaffiliated", "Alien", "Venus", "Earth"],
        Earth: ["Unaffiliated", "Alien", "Venus", "Mars"],
    };
    static rogueAllegiances: AllegianceKeys[] = ["Alien", "Unaffiliated"];

    get isAutoattacking() {
        return this.primaryFireState.autoattack && !this.target?.isIntangible;
    }

    get opposition(): AllegianceKeys[] {
        return Spaceship.allegianceOpposition[this.allegiance];
    }

    get enemies(): Spaceship[] {
        const all = this.scene.entityManager.getAll();
        const enemies = all.filter(
            (ship) => this.opposition.includes(ship.allegiance) && ship.id !== this.id
        );

        return enemies;
    }

    get activity(): MovementActivity {
        return this.status.speed ? "moving" : "stopped";
    }

    get hitboxRadius() {
        const hasShields = this.status.shieldsHp > 0;
        return hasShields ? this.shields.body.radius : this.body.radius;
    }

    get hitboxCircle() {
        return {
            x: this.x,
            y: this.y,
            r: this.hitboxRadius,
        };
    }

    get isExploding() {
        return this.isDead && this.isIntangible;
    }

    get isDead() {
        return this.status.hullHp <= 0;
    }

    get isMob() {
        return false;
    }
    get isPlayer() {
        return !this.isMob;
    }

    constructor(serverOptions: SpaceshipServerOptions, clientOptions: SpaceshipClientOptions) {
        super({ ...serverOptions, angle: null }, clientOptions);
        const { baseStats } = this.atlasMetadata;
        this.baseStats = baseStats;
        this.setCircularHitbox(this.baseStats.hitboxRadius);

        const { x, y } = serverOptions;
        this.staticBox = this.scene.add.rexContainerLite(
            x,
            y,
            this.body.width * this.scale,
            this.body.height * this.scale
        );
        this.rotatingBox = this.scene.add.rexContainerLite(
            x,
            y,
            this.body.width * this.scale,
            this.body.height * this.scale
        );
        this.scene.physics.world.enable(this.staticBox);
        // this.staticBox.body.setCollideWorldBounds(true);

        this.rotatingBox.pin(this, { syncPosition: false });

        this.shields = new Shields(this);
        this.staticBox.pin(this.shields, { syncRotation: false });
        this.staticBox.pin(this.rotatingBox, { syncPosition: false, syncRotation: false });

        // Modules
        const { modules } = this.atlasMetadata;
        this.modules = modules;

        const { scene } = clientOptions;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);

        const { multipliers } = serverOptions;
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, multipliers.damage);

        const { outfit } = serverOptions;
        this.outfitting = new Outfitting(scene, this, outfit);

        const { allegiance } = serverOptions;
        this.allegiance = allegiance;

        const { projectileGroup } = clientOptions;
        this.projectileGroup = projectileGroup;

        const { username } = serverOptions;
        this.setName(username);

        const { attackerReward } = serverOptions;
        this.status = new Status(
            { ship: this, baseStats, multipliers, attackerReward },
            { scene: this.scene }
        );
        if (this.status.shieldsHp === 0) this.shields.crack(false);

        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this.rotatingBox);
        const { angle } = serverOptions;
        this.setAngle(angle);

        // @ts-ignore
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this.staticBox);
        this.moveToPlugin.on("complete", () => this.onStopThrust());

        if (this.soundManager) {
            // Make sure relevant sounds are loaded
            this.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);
        }

        // Enables click events
        this.setInteractive();
        this.on("pointerdown", () => this.scene.input.emit("entity:targeted", this));
        this.setPointer(x, y);

        this.rotatingBox.setDepth(this.depth + 100);

        this.pilot = new Pilot();

        for (let i = 0; i < 100; i++) {
            this.setPosition(x, y);
        }
    }
    /**
     * Destroys not only the sprite itself, but also related objects pinned to its bounding box
     * @param fromScene
     */
    destroyFully(fromScene?: boolean) {
        this.setTarget();
        this.breakOffTargeting();
        this.staticBox.destroy(fromScene);
    }

    getHit(damage: number, attackerId?: string) {
        if (this.status.shieldsHp > 0) this.#getShieldsHit(damage, attackerId);
        else this.#getHullHit(damage, attackerId);
    }

    #getShieldsHit(damage: number, attackerId?: string) {
        this.shields.playShieldHit();
        const damageDealed = this.status.damageShields(damage);

        if (attackerId) this.status.attackerRecord.add(damageDealed, attackerId);
        if (this.status.shieldsHp <= 0) this.shields.crack();
    }
    #getHullHit(damage: number, attackerId?: string) {
        this.playHullHit();
        const damageDealed = this.status.damageHull(damage);

        if (attackerId) this.status.attackerRecord.add(damageDealed, attackerId);
        if (this.isDead && !this.isExploding) this.emit("entity:explode");
    }

    playHullHit() {
        if (this.soundManager) {
            this.soundManager.play("hit", {
                sourceX: this.x,
                sourceY: this.y,
                volume: 0.2,
            });
        }

        // TODO lastHit time variable in order not to bug out the tween, plus make it possible to regen shields
        this.getTinted;
        this.rotatingBox
            .getAllChildren()
            .forEach((sprite) => (sprite instanceof Sprite ? sprite.getTinted() : null));
    }

    explode() {
        this.breakOffTargeting();
        this.setTarget();
        this.stopThrust();

        this.setIntangible(true);

        if (this.scene.isTextured) {
            new Explosion(this.scene, this.x, this.y, this.depth, this.soundManager, {
                double: true,
            });
        }

        this.scene.time.delayedCall(2000, () => {
            if (this.isDead) this.setHidden(true);

            this.emit("entity:dead", this);
        });
    }

    toggleAutoattack() {
        if (this.target) this.primaryFireState.autoattack = !this.primaryFireState.autoattack;
    }

    /**
     * Sets reference to spaceship for autoattacking, also:
     *  - adds brackets to that spaceship's name
     *  - updates list of targetedBy of that spaceship with current spaceship
     * @param target
     */
    setTarget(target: Spaceship = null) {
        const prevTarget = this.target;

        const notSameTarget = target !== prevTarget;
        const didNotTargetSelf = target !== this;

        const isValidNewTarget = notSameTarget && didNotTargetSelf;
        if (isValidNewTarget) {
            if (prevTarget) {
                const { followText } = prevTarget.status;
                followText.setText(followText.text.slice(1, -1));
                prevTarget.targetedBy = prevTarget.targetedBy.filter(
                    (targetee) => targetee !== this
                );
                this.primaryFireState.autoattack = false;
            }

            if (target) {
                target.status.followText.setText("[" + target.status.followText.text + "]");
                target.targetedBy.push(this);
            }
            this.target = target;
        }
    }

    setTargetById(targetId: string) {
        const target = this.scene.entityManager.getById(targetId);
        if (target) this.setTarget(target);
    }

    setPointer(worldX?: number, worldY?: number) {
        if (worldX === undefined || worldY === undefined) {
            const { x, y } = this.getActionsState();
            worldX = x;
            worldY = y;
        }
        this.#pointer = { worldX, worldY };
    }
    get pointer() {
        if (!this.isAutoattacking) return this.#pointer;
        else {
            const { x: worldX, y: worldY } = this.target.getActionsState();
            return { worldX, worldY };
        }
    }

    lookAtPointer() {
        if (!this.isIntangible) {
            let { worldX, worldY } = this.pointer;
            const rotation = Phaser.Math.Angle.Between(this.x, this.y, worldX, worldY);
            this.rotateTo(rotation);
        }
    }

    breakOffTargeting() {
        this.targetedBy.forEach((targetee) => targetee.setTarget());
        this.targetedBy = [];
    }

    teleport(worldX: number, worldY: number, map?: string) {
        this.stopThrust();
        this.emit("entity:teleport", { entity: this, point: { worldX, worldY } });
        this.staticBox.setPosition(worldX, worldY);
    }

    respawn(worldX: number, worldY: number) {
        this.stopThrust();
        this.status.reset();
        this.teleport(worldX, worldY);

        this.setHidden(false).setIntangible(false);

        if (this.status.shieldsHp === 0) this.shields.crack(false);

        return [worldX, worldY];
    }

    get isIntangible() {
        return !this.staticBox.body.enable && !this.shields.body.enable;
    }
    setIntangible(value = true) {
        this.staticBox.body.setEnable(!value);
        this.shields.body.setEnable(!value);
        return this;
    }

    get isHidden() {
        return !this.staticBox.visible;
    }
    setHidden(value = true) {
        this.staticBox.setVisible(!value);
        return this;
    }

    setAngle(angle?: number) {
        this.rotatingBox.setAngle(angle);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }
    setRotation(rotation?: number) {
        this.rotatingBox.setRotation(rotation);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }

    rotateTo(rotation: number, speed = this.status.maxSpeed) {
        const newAngle = Phaser.Math.RadToDeg(rotation + Math.PI / 2);
        const angleDiff = Math.abs(Phaser.Math.Angle.WrapDegrees(newAngle - this.angle));

        // Prevent jerkiness when moving and aiming just to the side
        const smoothingRangeDeg = 20;
        const smoothing = angleDiff < smoothingRangeDeg ? angleDiff / smoothingRangeDeg : 1;

        this.rotateToPlugin.rotateTo(newAngle, 0, speed * smoothing);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
    }

    moveTo(x: number, y: number) {
        if (!this.isIntangible) {
            this.moveToPlugin.setSpeed(this.status.maxSpeed);

            this.moveToPlugin.moveTo(x, y);
            this.onStartThrust();
        }
    }

    stopThrust() {
        // this.staticBox.body.stop();
        this.moveToPlugin.stop();
        this.setThrust();
        this.onStopThrust();
    }

    onStartThrust() {
        this.exhausts.startExhaust();
    }
    onStopThrust() {
        this.exhausts.stopExhaust();
    }

    thrustUp() {
        if (!this.isIntangible) {
            const rotation = -Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustDown() {
        if (!this.isIntangible) {
            const rotation = Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustLeft() {
        if (!this.isIntangible) {
            const rotation = Math.PI;
            this.setThrust(rotation, 1);
        }
    }
    thrustRight() {
        if (!this.isIntangible) {
            const rotation = 0;
            this.setThrust(rotation, 1);
        }
    }

    thrustUpRight() {
        if (!this.isIntangible) {
            const rotation = -Math.PI / 4;
            this.setThrust(rotation, 1);
        }
    }
    thrustUpLeft() {
        if (!this.isIntangible) {
            const rotation = -Math.PI / 4 - Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    thrustDownRight() {
        if (!this.isIntangible) {
            const rotation = Math.PI / 4;
            this.setThrust(rotation, 1);
        }
    }
    thrustDownLeft() {
        if (!this.isIntangible) {
            const rotation = Math.PI / 4 + Math.PI / 2;
            this.setThrust(rotation, 1);
        }
    }
    /**
     * Moves ship right, relative to the ship rotation, instead of to the screen's right side
     */
    thrustSidewaysRight() {
        if (!this.isIntangible) {
            const rotation = this.rotation;
            this.setThrust(rotation, 1);
        }
    }
    /**
     * Moves ship left relative to the ship rotation, instead of to the screen's left side
     */
    thrustSidewaysLeft() {
        if (!this.isIntangible) {
            const rotation = this.rotation + Math.PI;
            this.setThrust(rotation, 1);
        }
    }

    thrust() {
        let movedFromThrust = false;
        if (!this.isIntangible) {
            const { rotation, velocityPercentage } = this.#thrust;
            const speed = this.status.maxSpeed * velocityPercentage;

            // TODO tweak magnitude and acceleration multipliers
            const gravity = { ...this.scene.getGravity(this), accelerationMultiplier: 5 };

            this.move([{ rotation, magnitude: speed, accelerationMultiplier: 7 }, gravity]);
            movedFromThrust = velocityPercentage > 0;
        }

        if (movedFromThrust) this.onStartThrust();
        else this.onStopThrust();
    }

    setThrust(rotation: number = this.#thrust.rotation, velocityPercentage: number = 0) {
        this.#thrust.rotation = rotation;
        this.#thrust.velocityPercentage = velocityPercentage;
    }

    move(movements: MovementVector[]) {
        // Velocity
        let vx = 0;
        let vy = 0;
        // Acceleration
        let ax = 0;
        let ay = 0;

        movements.forEach(({ rotation, magnitude, accelerationMultiplier }) => {
            const velocityX = magnitude * Math.cos(rotation);
            const velocityY = magnitude * Math.sin(rotation);

            vx += velocityX;
            vy += velocityY;
            ax += velocityX * accelerationMultiplier;
            ay += velocityY * accelerationMultiplier;
        });
        const targetSpeed = (vx ** 2 + vy ** 2) ** 0.5;

        this.staticBox.body.setAcceleration(ax, ay);
        this.staticBox.body.setMaxSpeed(targetSpeed);
    }

    primaryFire(time: number) {
        this.weapons.primaryFire(time, this.pointer);
    }

    update(time: number, delta: number) {
        this.lookAtPointer();
        this.status.update(time, delta);

        if (this.isAutoattacking) {
            const dist = Phaser.Math.Distance.BetweenPoints(this, this.target);
            if (dist < 900) {
                this.primaryFire(time);
            }
        } else if (this.primaryFireState.active) {
            this.primaryFire(time);
        }
        this.weapons.update(time, delta);
    }

    getActionsState(): ActionsState {
        const { x, y } = this.staticBox;
        const { id, angle, activity } = this;

        const { active, autoattack } = this.primaryFireState;
        const primaryFireActive = active ? 1 : 0;
        const primaryFireAutoattack = autoattack ? 1 : 0;
        const targetId = this.target?.id;
        const hidden = this.isHidden ? 1 : 0;
        const intangible = this.isIntangible ? 1 : 0;
        return {
            id,
            groupName: this.isPlayer ? "players" : "mob",
            x,
            y,
            angle,
            activity,
            ...this.#pointer,
            primaryFireAutoattack,
            primaryFireActive,
            targetId,
            hidden,
            intangible,
        };
    }

    setActionsState({
        x,
        y,
        angle,
        worldX,
        worldY,
        activity,
        primaryFireActive,
        primaryFireAutoattack,
        targetId,
        hidden,
        intangible,
    }: ActionsState) {
        this.staticBox.setPosition(x, y);
        this.setPointer(worldX, worldY);
        this.rotateTo(Phaser.Math.DegToRad(angle - 90));

        if (activity === "moving") {
            this.onStartThrust();
        } else if (activity === "stopped") {
            this.onStopThrust();
        }

        this.primaryFireState = {
            active: !!primaryFireActive,
            autoattack: !!primaryFireAutoattack,
        };
        if (targetId) this.setTargetById(targetId);

        this.setHidden(!!hidden).setIntangible(!!intangible);
    }

    getStatusState(): StatusState {
        return this.status.getState();
    }

    setStatusState(newStatus: StatusState) {
        const shieldDiff = this.status.shieldsHp - newStatus.shieldsHp;
        if (shieldDiff > 0) this.#getShieldsHit(shieldDiff);
        else if (shieldDiff < 0) this.status.healShields(shieldDiff);

        const healthDiff = this.status.hullHp - newStatus.hullHp;
        if (healthDiff > 0) this.#getHullHit(healthDiff);
        else if (healthDiff < 0) this.status.healHull(healthDiff);
    }
}
