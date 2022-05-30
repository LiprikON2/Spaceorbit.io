import Explosion from "./explosion";
import Exhausts from "./exhausts";
import Weapons from "./weapons";
import Shields from "./shields";

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
    halfWidth: number;
    halfHeight: number;

    enemies: Spaceship[];
    modules;
    baseSpecs;
    sounds;
    status;
    exhausts: Exhausts;
    rotateToPlugin;
    moveToPlugin;
    weapons;
    shields;

    constructor(scene, x, y, atlasTexture, enemies: Spaceship[] = [], depth = 10) {
        super(scene, x, y, atlasTexture);

        const atlas = scene.textures.get(atlasTexture);
        const scale = atlas.customData["meta"].scale;
        this.baseSpecs = atlas.customData["meta"].baseSpecs;
        this.modules = atlas.customData["meta"].modules;

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setCollideWorldBounds(true).setOrigin(0.5).setDepth(depth);
        this.setScale(scale);

        this.status = { health: this.baseSpecs.health, shields: 10000 };

        // Add ship sounds
        // @ts-ignore
        this.scene.soundManager.addSounds("hit", ["hit_sound_1", "hit_sound_2"]);

        this.halfWidth = this.body.width / 2;
        this.halfHeight = this.body.height / 2;
        this.setCircularHitbox(this.baseSpecs.hitboxRadius);

        this.exhausts = new Exhausts(scene, this, this.modules.exhaustOrigins);
        this.weapons = new Weapons(scene, this, this.modules.weaponOrigins);
        this.enemies = enemies;

        // @ts-ignore
        this.rotateToPlugin = scene.plugins.get("rexRotateTo").add(this);
        this.moveToPlugin = scene.plugins.get("rexMoveTo").add(this);
        this.moveToPlugin.on("complete", () => this.stoppedMoving());
        this.setName(Phaser.Utils.String.UUID());

        this.shields = new Shields(this.scene, this);
        // @ts-ignore
        this.body.onWorldBounds = true;
    }

    getSpeed() {
        // Each additional engine gives 20% speed boost
        const speed = this.baseSpecs.speed;
        const countOfAdditionalEngines = this.exhausts.exhaustCount - 1;

        const finalSpeed = 0.2 * speed * countOfAdditionalEngines + speed;
        return finalSpeed;
    }

    setCircularHitbox(hitboxRadius) {
        this.body.setCircle(
            hitboxRadius,
            this.halfWidth - hitboxRadius,
            this.halfHeight - hitboxRadius
        );
    }
    getHit(projectile) {
        // console.log(this.status.shields, this.status.health);
        if (this.status.shields > 0) {
            // Damage to the shield
            this.shields.getHit();

            this.status.shields -= projectile.weapon.projectileDamage;

            if (this.status.shields <= 0) {
                this.status.shields = 0;
                this.shields.disable();
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

            this.status.health -= projectile.weapon.projectileDamage;

            if (this.status.health <= 0) {
                this.status.health = 0;
                this.explode();
            }
        }
    }
    explode() {
        this.disableBody(true, false);
        this.resetMovement();
        this.emit("dead", this.name);

        new Explosion(this.scene, this.x, this.y, this.depth, {
            double: true,
        });

        this.scene.time.delayedCall(2000, () => this.respawn());
    }

    respawn() {
        // @ts-ignore
        const { x, y } = this.scene.getRandomPositionOnMap();
        this.x = x;
        this.y = y;
        this.shields.x = x;
        this.shields.y = y;
        this.status.health = this.baseSpecs.health;
        this.status.shields = 10000; // todo

        this.scene.physics.add.existing(this);
        this.scene.physics.add.existing(this.shields);
        this.shields.active = true;
        this.shields.visible = true;
        this.active = true;
        this.stoppedMoving();
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
        if (this.active) {
            this.setVelocityY(-this.getSpeed());
            this.shields.setVelocityY(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDown() {
        if (this.active) {
            this.setVelocityY(this.getSpeed());
            this.shields.setVelocityY(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveLeft() {
        if (this.active) {
            this.setVelocityX(-this.getSpeed());
            this.shields.setVelocityX(-this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveRight() {
        if (this.active) {
            this.setVelocityX(this.getSpeed());
            this.shields.setVelocityX(this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    moveUpRight() {
        if (this.active) {
            const angle = -Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveUpLeft() {
        if (this.active) {
            const angle = -Math.PI / 4 - Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownRight() {
        if (this.active) {
            const angle = Math.PI / 4;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }
    moveDownLeft() {
        if (this.active) {
            const angle = Math.PI / 4 + Math.PI / 2;
            this.body.velocity.setToPolar(angle, this.getSpeed());
            this.shields.body.velocity.setToPolar(angle, this.getSpeed());
            this.exhausts.startExhaust();
        }
    }

    // Move right relative to the ship rotation, instead of to the screen's right side
    moveRightRelative() {
        const angle = this.rotation;
        this.body.velocity.setToPolar(angle, this.getSpeed());
        this.shields.body.velocity.setToPolar(angle, this.getSpeed());
        this.exhausts.startExhaust();
    }
    // Move left relative to the ship rotation, instead of to the screen's left side
    moveLeftRelative() {
        const angle = this.rotation + Math.PI;
        this.body.velocity.setToPolar(angle, this.getSpeed());
        this.shields.body.velocity.setToPolar(angle, this.getSpeed());
        this.exhausts.startExhaust();
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
