import Explosion from "./explosion";
import Exhausts from "./exhausts";
import Weapons from "./weapons";
import Shields from "./shields";

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    halfWidth: number;
    halfHeight: number;

    enemies: Spaceship[];
    modules: { exhaustOrigins: any; weaponOrigins: any };
    baseSpecs: { health: number; hitboxRadius: number; speed: number };
    status: {
        shields: number;
        health: number;
        multipliers: { speed: number; health: number; shields: number; damage: number };
    };
    exhausts: Exhausts;
    weapons: Weapons;
    shields: Shields;
    lastMoveInput: { rotation: number; force: number } = { rotation: 0, force: 0 };
    rotateToPlugin;
    moveToPlugin;
    outfit;

    constructor(
        scene,
        x,
        y,
        atlasTexture,
        outfit,
        multipliers = { speed: 1, health: 1, shields: 1, damage: 1 },
        enemies: Spaceship[] = [],
        depth = 10
    ) {
        super(scene, x, y, atlasTexture);

        this.outfit = outfit;
        const atlas = scene.textures.get(atlasTexture);
        const scale = atlas.customData["meta"].scale;

        this.modules = atlas.customData["meta"].modules;
        this.baseSpecs = atlas.customData["meta"].baseSpecs;
        this.status = {
            multipliers,
            health: 0,
            shields: 0,
        };
        this.status.health = this.getMaxHealth();
        this.status.shields = this.getMaxShields();

        // Phaser stuff
        scene.add.existing(this);
        scene.physics.add.existing(this);
        // @ts-ignore
        this.body.onWorldBounds = true;

        this.setCollideWorldBounds(true).setOrigin(0.5).setDepth(depth);
        this.setName(Phaser.Utils.String.UUID());
        this.setScale(scale);

        // Sounds
        // @ts-ignore
        this.scene.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);

        // Dimentions
        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.baseSpecs.hitboxRadius);

        // Modules
        const damageMultiplier = this.status.multipliers.damage;
        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins, damageMultiplier);
        this.shields = new Shields(scene, this);

        this.enemies = enemies;

        // Movement plugins
        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this);
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this);
        this.moveToPlugin.on("complete", () => this.stoppedMoving());

        this.reoutfit();
        if (this.status.shields === 0) this.shields.crack(true);
    }

    reoutfit() {
        let extraItems: any[] = [];

        // console.table(this.outfit);

        const weapons = this.outfit.weapons ?? [];
        weapons.forEach((weapon, index) => {
            const doesFit = this.weapons.placeWeapon(weapon?.itemName, index);
            if (!doesFit && weapon !== null) {
                extraItems.push(weapon);
                weapons.splice(index);
            }
        });
        if (this.weapons.getWeaponCount() >= weapons.length) {
            const emptySlotsToAdd = this.weapons.getWeaponCount() - weapons.length;

            const emptySlots = Array(emptySlotsToAdd).fill(null);
            this.outfit.weapons = weapons.concat(emptySlots);
        }

        const engines = this.outfit.engines ?? [];
        engines.forEach((engine, index) => {
            const doesFit = this.exhausts.placeEngine(engine?.itemName, index);
            if (!doesFit && engine !== null) {
                extraItems.push(engine);
                engines.splice(index); // bug
            }
        });
        const auxiliaryEngineSize = this.exhausts.getEngineCount();
        if (auxiliaryEngineSize >= engines.length) {
            const emptySlotsToAdd = auxiliaryEngineSize - engines.length;

            const emptySlots = Array(emptySlotsToAdd).fill(null);
            this.outfit.engines = engines.concat(emptySlots);
        }

        const inventorySize = 36;
        this.outfit.inventory = this.outfit.inventory.concat(extraItems);
        if (inventorySize >= this.outfit.inventory.length) {
            const emptySlotsToAdd = inventorySize - this.outfit.inventory.length;

            const emptySlots = Array(emptySlotsToAdd).fill(null);
            this.outfit.inventory = this.outfit.inventory.concat(emptySlots);
        }
    }

    getOutfit() {
        return this.outfit;
    }

    getSpeed() {
        // Each additional engine gives 20% speed boost
        const speed = this.baseSpecs.speed;
        const countOfAdditionalEngines = this.exhausts.getEngineCount() - 1;
        const speedMultiplier = this.status.multipliers.speed;

        const shipSpeed = speed + 0.2 * speed * countOfAdditionalEngines;
        return shipSpeed * speedMultiplier;
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }
    getHit(projectile) {
        const damageMultiplier = projectile.weapon.multiplier;
        const damage = projectile.weapon.projectileDamage * damageMultiplier;
        console.log(this.status.shields, this.status.health);
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
            // @ts-ignore
            this.scene.soundManager.play("hit", {
                sourceX: this.x,
                sourceY: this.y,
                volume: 0.2,
            });

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
        this.disableBody(true, false);
        this.resetMovement();
        this.emit("dead", this.name); // todo

        // TODO add variety ("explosion patterns")
        new Explosion(this.scene, this.x, this.y, this.depth, {
            double: true,
        });

        this.scene.time.delayedCall(2000, () => this.respawn());
    }

    getMaxHealth() {
        const healthMultiplier = this.status.multipliers.health;
        return this.baseSpecs.health * healthMultiplier;
    }
    getMaxShields() {
        const shieldsMultiplier = this.status.multipliers.shields;
        return 10000 * shieldsMultiplier;
    }

    respawn() {
        // @ts-ignore
        const { x, y } = this.scene.getRandomPositionOnMap();
        this.x = x;
        this.y = y;
        this.shields.x = x;
        this.shields.y = y;
        this.status.health = this.getMaxHealth();
        this.status.shields = this.getMaxShields();

        this.scene.physics.add.existing(this);
        this.scene.physics.add.existing(this.shields);
        this.shields.active = true;
        this.shields.visible = true;
        this.active = true;
        this.stoppedMoving();
        if (this.status.shields === 0) this.shields.crack(true);
    }

    lookAtPoint(cursorX, cursorY) {
        const rotation = Phaser.Math.Angle.Between(this.x, this.y, cursorX, cursorY) + Math.PI / 2;

        this.rotateTo(rotation);
    }

    rotateTo(rotation) {
        this.rotateToPlugin.rotateTo(Phaser.Math.RadToDeg(rotation), 0, this.getSpeed());
        this.exhausts.updateExhaustPosition();
    }

    moveTo(x, y) {
        const speed = this.getSpeed();
        this.moveToPlugin.setSpeed(speed);

        this.moveToPlugin.moveTo(x, y);
        this.shields.moveTo(x, y);
        this.exhausts.startExhaust();
    }

    resetMovement() {
        this.setVelocity(0);
        this.shields.setVelocity(0);
        this.moveToPlugin.stop();
        this.shields.moveToPlugin.stop();
    }
    stoppedMoving() {
        this.exhausts.stopExhaust();
    }
    moveUp() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityY(-this.getSpeed());
            this.shields.setVelocityY(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDown() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityY(this.getSpeed());
            this.shields.setVelocityY(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveLeft() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(-this.getSpeed());
            this.shields.setVelocityX(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveRight() {
        if (this.active && !this.isUsingJoystick()) {
            this.setVelocityX(this.getSpeed());
            this.shields.setVelocityX(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = -Math.PI / 4 - Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = Math.PI / 4 + Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    // Move right relative to the ship rotation, instead of to the screen's right side
    moveRightRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    // Move left relative to the ship rotation, instead of to the screen's left side
    moveLeftRelative() {
        if (this.active && !this.isUsingJoystick()) {
            const angle = this.rotation + Math.PI;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
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
            const speed = this.getSpeed() * this.lastMoveInput.force;

            this.body.velocity.setToPolar(rotation, speed);
            this.shields.body.velocity.setToPolar(rotation, speed);
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

    getRotatedPoint(point, absolute = false, rotation = this.rotation) {
        // The center of the ship is xOy
        // Distance from center of a ship to a point on a ship; Corresponds to Y
        const R = Phaser.Math.Distance.Between(this.halfWidth, this.halfHeight, point.x, point.y);

        // Corresponds to X
        const additionalRotation = Phaser.Math.Angle.Between(
            this.halfWidth,
            this.halfHeight,
            point.x,
            point.y
        );

        let offsetX;
        let offsetY;
        if (absolute) {
            // If needed absolute coordinates, use current position of a ship in a world as a circle origin
            offsetX = R * Math.cos(rotation + additionalRotation) + this.x;
            offsetY = R * Math.sin(rotation + additionalRotation) + this.y;
        } else {
            // Otherwise use relative to the sprite coordinates
            offsetX = R * Math.cos(rotation + additionalRotation);
            offsetY = R * Math.sin(rotation + additionalRotation);
        }
        return { offsetX, offsetY };
    }
}
