import type ContainerLite from "phaser3-rex-plugins/plugins/gameobjects/container/containerlite/ContainerLite";
import type RotateTo from "phaser3-rex-plugins/plugins/rotateto";
import type MoveTo from "phaser3-rex-plugins/plugins/moveto";

import Explosion from "./Explosion";
import Exhausts from "./Exhausts";
import Weapons from "./Weapons";
import Shields from "./Shields";
import Outfitting, { type Outfit } from "./Outfitting";
import { Sprite, type SpriteClientOptions, type SpriteServerOptions } from "../Sprite";

export enum AllegianceEnum {
    // AlienNeutral = "AlienNeutral",
    // AlienHostile = "AlienHostile",
    Unaffiliated = "Unaffiliated",
    Alien = "Alien",
    Venus = "Venus",
    Mars = "Mars",
    Earth = "Earth",
}
type AllegianceKeys = keyof typeof AllegianceEnum;

type AllegianceOpposition = {
    [key in AllegianceKeys]: AllegianceKeys[];
};

export interface SpaceshipServerOptions extends SpriteServerOptions {
    outfit: Outfit;
    allegiance: AllegianceEnum;
}

export interface SpaceshipClientOptions extends SpriteClientOptions {
    allGroup: Phaser.GameObjects.Group;
}

export class Spaceship extends Sprite {
    modules: {
        exhaustOrigins: { x: number; y: number }[];
        weaponOrigins: { x: number; y: number }[];
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    lastMoveInput: { rotation: number; force: number } = { rotation: 0, force: 0 };

    outfitting;
    followText;

    target: Spaceship | null;
    targetedBy: Spaceship[] = [];
    allGroup: Phaser.GameObjects.Group;
    toggleFire = false;

    allegiance: AllegianceEnum | AllegianceKeys;
    allegianceOpposition: AllegianceOpposition = {
        Unaffiliated: ["Unaffiliated", "Alien", "Venus", "Mars", "Earth"],
        Alien: ["Unaffiliated", "Venus", "Mars", "Earth"],
        Venus: ["Unaffiliated", "Alien", "Mars", "Earth"],
        Mars: ["Unaffiliated", "Alien", "Venus", "Earth"],
        Earth: ["Unaffiliated", "Alien", "Venus", "Mars"],
    };
    boundingBox: ContainerLite & { body: Phaser.Physics.Arcade.Body };
    rotateToPlugin: RotateTo;
    moveToPlugin: MoveTo;

    get opposition(): AllegianceKeys[] {
        return this.allegianceOpposition[this.allegiance];
    }

    get enemies(): Spaceship[] {
        const all = this.allGroup.getChildren() as Spaceship[];
        const enemies = all.filter(
            (ship) => this.opposition.includes(ship.allegiance) && ship.id !== this.id
        );

        return enemies;
    }

    get maxSpeed() {
        const speedBoost = 0.2;
        const speed = this.baseStats.speed;
        const countOfAdditionalEngines = this.exhausts.getEngineCount() - 1;
        const speedMultiplier = this.status.multipliers.speed;

        // Each additional engine gives 20% speed boost
        const shipSpeed = speed + speed * speedBoost * countOfAdditionalEngines;
        return shipSpeed * speedMultiplier;
    }

    constructor(serverOptions: SpaceshipServerOptions, clientOptions: SpaceshipClientOptions) {
        super(serverOptions, clientOptions);

        const { modules } = this.atlasMetadata;
        this.modules = modules;

        // Dimentions
        this.setCircularHitbox(this.baseStats.hitboxRadius);

        // Modules
        const { scene } = clientOptions;
        const damageMultiplier = this.status.multipliers.damage;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, damageMultiplier);
        this.shields = new Shields(this);

        const { outfit } = serverOptions;
        this.outfitting = new Outfitting(scene, this, outfit);

        const { allegiance } = serverOptions;
        this.allegiance = allegiance;

        const { allGroup } = clientOptions;
        this.allGroup = allGroup;

        if (this.soundManager) this.soundManager.makeTarget(this);
        if (this.status.shields === 0) this.shields.crack(true);

        // Text
        // TODO make a display class
        // TODO use `Nine Slice Game Object` to display hp
        const { username, x, y } = serverOptions;
        this.setName(username);
        const textOffsetY = this.body.height * this.scale;
        this.followText = this.scene.add
            .text(x, y + textOffsetY, username, { fontSize: "2rem" })
            .setAlign("center")
            .setOrigin(0.5)
            .setAlpha(1)
            .setDepth(this.depth + 5);

        // Movement
        this.boundingBox = this.scene.add.rexContainerLite(
            x,
            y,
            this.body.width * this.scale,
            this.body.height * this.scale
        );
        this.scene.physics.world.enable(this.boundingBox);
        this.scene.physics.world.enableBody(this.boundingBox);
        this.boundingBox.pin(this, { syncRotation: false });
        this.boundingBox.pin(this.shields, { syncRotation: false });
        this.boundingBox.pin(this.followText, { syncRotation: false });
        this.boundingBox.body.setCollideWorldBounds(true);

        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this);
        // @ts-ignore
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this.boundingBox);
        this.moveToPlugin.on("complete", () => this.onStopMoving());

        if (this.isTextured) {
            this.setPipeline("Light2D");
            const light = this.scene.lights.addLight(0, 0, 10000).setIntensity(0.5);
            this.scene.lights.enable().setAmbientColor(0x888888);
        }
    }

    getClientState() {
        const { x, y, angle } = this;
        return { x, y, angle };
    }

    setClientState({ x, y, angle }) {
        this.boundingBox.x = x;
        this.boundingBox.y = y;
        this.angle = angle;
    }

    getHit(projectile) {
        const damageMultiplier = projectile.weapon.multiplier;
        const damage = projectile.weapon.projectileDamage * damageMultiplier;
        // console.log(this.status.shields, this.status.health);
        if (this.status.shields > 0) {
            // Damage to the shield
            this.shields.getHit();

            this.status.shields -= damage;

            if (this.status.shields <= 0) {
                this.status.shields = 0;
                this.shields.crack();
            }
        } else {
            // Damage to the hull
            if (this.soundManager) {
                this.soundManager.play("hit", {
                    sourceX: this.x,
                    sourceY: this.y,
                    volume: 0.2,
                });
            }

            // TODO lastHit time variable in order not to bug out the tween, plus make it possible to regen shields
            this.setTint(0xee4824);
            this.scene.time.delayedCall(200, () => this.clearTint());

            this.status.health -= damage;

            if (this.status.health <= 0) {
                this.status.health = 0;
                this.explode();
            }
        }
    }

    explode() {
        this.boundingBox.body.enable = false;
        this.disableBody(true, false);
        this.resetMovement();
        this.emit("dead", this.id);

        // TODO add variety ("explosion patterns")
        if (this.isTextured) {
            new Explosion(this.scene, this.x, this.y, this.depth, {
                double: true,
            });
        }

        this.scene.time.delayedCall(2000, () => this.respawn());
    }

    setTarget(target: Spaceship | null = null) {
        const prevTarget = this.target;

        if (target !== prevTarget && target !== this) {
            if (prevTarget) {
                const { followText } = prevTarget;
                followText.setText(followText.text.slice(1, -1));
                prevTarget.targetedBy = prevTarget.targetedBy.filter(
                    (targetee) => targetee !== this
                );
                this.toggleFire = false;
            }

            if (target) {
                target.followText.setText("[" + target.followText.text + "]");
                target.targetedBy.push(this);
            }
            this.target = target;
        }
    }

    breakOffTargeting() {
        this.targetedBy.forEach((targetee) => targetee.setTarget());
        this.targetedBy = [];
    }

    teleport(x?, y?, map?) {
        if (typeof x === "undefined" || typeof y === "undefined") {
            // @ts-ignore
            ({ x, y } = this.scene.getRandomPositionOnMap());
        }
        this.boundingBox.x = x;
        this.boundingBox.y = y;
    }

    respawn(x?, y?) {
        this.breakOffTargeting();
        this.setTarget();
        this.teleport(x, y);

        this.boundingBox.body.enable = true;
        this.status.health = this.maxHealth;
        this.status.shields = this.maxShields;

        this.scene.physics.add.existing(this);
        this.scene.physics.add.existing(this.shields);
        this.shields.active = true;
        this.shields.visible = true;
        this.active = true;
        this.onStopMoving();
        if (this.status.shields === 0) this.shields.crack(true);
    }

    lookAtPoint(worldX, worldY) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, worldX, worldY);
        this.rotateTo(rotation);
    }

    rotateTo(rotation) {
        this.rotateToPlugin.rotateTo(
            Phaser.Math.RadToDeg(rotation + Math.PI / 2),
            0,
            this.maxSpeed
        );
        if (this.exhausts) this.exhausts.updateExhaustPosition();
    }

    setAngle(angle?: number) {
        super.setAngle(angle);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }
    setRotation(rotation?: number) {
        super.setRotation(rotation);
        if (this.exhausts) this.exhausts.updateExhaustPosition();
        return this;
    }

    toggleAttack() {
        if (this.target) {
            this.toggleFire = !this.toggleFire;
        }
    }

    moveTo(x, y) {
        this.moveToPlugin.setSpeed(this.maxSpeed);

        this.moveToPlugin.moveTo(x, y);
        this.exhausts.startExhaust();
    }

    resetMovement() {
        this.boundingBox.body.stop();
        this.moveToPlugin.stop();
    }
    onStopMoving() {
        this.exhausts.stopExhaust();
    }

    moveUp() {
        if (this.active && !this.isUsingJoystick()) {
            this.boundingBox.body.setVelocityY(-this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDown() {
        if (this.active && !this.isUsingJoystick()) {
            this.boundingBox.body.setVelocityY(this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveLeft() {
        if (this.active && !this.isUsingJoystick()) {
            this.boundingBox.body.setVelocityX(-this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveRight() {
        if (this.active && !this.isUsingJoystick()) {
            this.boundingBox.body.setVelocityX(this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4;
            this.boundingBox.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4 - Math.PI / 2;
            this.boundingBox.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4;
            this.boundingBox.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4 + Math.PI / 2;
            this.boundingBox.body.velocity.setToPolar(angle, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    /**
     * Moves ship right, relative to the ship rotation, instead of to the screen's right side
     */
    moveRightRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const rotation = this.rotation;
            this.boundingBox.body.velocity.setToPolar(rotation, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }
    /**
     * Moves ship left relative to the ship rotation, instead of to the screen's left side
     */
    moveLeftRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const rotation = this.rotation + Math.PI;
            this.boundingBox.body.velocity.setToPolar(rotation, this.maxSpeed);
            this.exhausts.startExhaust();
        }
    }

    isUsingJoystick() {
        return this.lastMoveInput.force !== 0;
    }

    // For using virtual omni-directional joystick
    move() {
        let hasMoved = false;
        if (this.active && this.isUsingJoystick()) {
            const rotation = this.lastMoveInput.rotation;
            const speed = this.maxSpeed * this.lastMoveInput.force;

            this.boundingBox.body.velocity.setToPolar(rotation, speed);
            this.exhausts.startExhaust();
            hasMoved = true;
        }

        return hasMoved;
    }

    setMove(angle, force) {
        this.lastMoveInput.rotation = Phaser.Math.DegToRad(angle);
        this.lastMoveInput.force = force;
    }

    primaryFire(time, cursor?: { cursorX: number; cursorY: number }) {
        if (this.active) {
            this.weapons.primaryFire(time, cursor);
        }
    }

    update(time: number, delta: number) {}
}
