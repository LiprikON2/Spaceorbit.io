import Spaceship from "./objects/ship/spaceship";

enum Direction {
    Left,
    Right,
    Still,
}

export default class Mob extends Spaceship {
    isReadyToFire: boolean = false;
    isSleeping: boolean = false;
    isAggresive: boolean = true;

    enemyTarget;
    readyToFireEvent;
    sleepEvent;
    preferedMovement: Direction = 0;
    reactionTime: number;
    jitter: { x: number; y: number } = { x: 0, y: 0 };

    constructor(scene, x, y, atlasTexture, outfit, enemies: Spaceship[] = [], depth = 10) {
        super(scene, x, y, atlasTexture, outfit, enemies, depth);
        this.reactionTime = Phaser.Math.Between(2500, 4500);
    }

    sleep(time) {
        // Usefull for doing some things only once in a while
        if (!this.sleepEvent) {
            this.sleepEvent = this.scene.time.delayedCall(time, () => {
                this.isSleeping = !this.isSleeping;
                this.sleepEvent.destroy();
                this.sleepEvent = null;

                const enumLength = Object.keys(Direction).length / 2;
                this.preferedMovement = Phaser.Math.Between(0, enumLength - 1);

                // TODO adjust
                const jitter = 25;
                this.jitter.x = Phaser.Math.Between(-jitter, jitter);
                this.jitter.y = Phaser.Math.Between(-jitter, jitter);
            });
        }
    }

    // Returns random point which is at least margin away from the world boundaries
    // and differs in +/- step from current x and y position
    getNextPoint(margin = 300, step = 1000) {
        const worldMinWidth = margin;
        const worldMinHeight = margin;
        const worldMaxWidth = this.scene.physics.world.bounds.width - margin;
        const worldMaxHeight = this.scene.physics.world.bounds.height - margin;

        const maxX = Math.min(this.x + step, worldMaxWidth);
        const minX = Math.max(this.x - step, worldMinWidth);
        const maxY = Math.min(this.y + step, worldMaxHeight);
        const minY = Math.max(this.y - step, worldMinHeight);

        const x = Phaser.Math.Between(minX, maxX);
        const y = Phaser.Math.Between(minY, maxY);

        return { x, y };
    }

    update(time, delta) {
        this.sleep(this.reactionTime);
        this.exhausts.updateExhaustPosition();
        let hasMoved = false;
        // TODO they may get stuck in on the boundaries

        // If it is wandering
        if (!this.enemyTarget && !this.isSleeping) {
            const closestEnemy = this.scene.physics.closest(this, this.enemies);
            // @ts-ignore
            const dist = Phaser.Math.Distance.BetweenPoints(this, closestEnemy);

            // TODO emit "got shot by" event to aggro on the shooter

            // Aggro on the closest enemy
            if (this.isAggresive && dist < 1000) {
                this.enemyTarget = closestEnemy;
            }

            if (!this.moveToPlugin.isRunning) {
                const { x, y } = this.getNextPoint();
                this.moveTo(x, y);
                this.lookAtPoint(x, y);
                hasMoved = true;
            }
        }

        // If it is aggroed on someone
        if (this.enemyTarget) {
            const { x, y } = this.enemyTarget;
            const dist = Phaser.Math.Distance.BetweenPoints(this, this.enemyTarget);

            // Shooting logic
            this.lookAtPoint(x, y);

            if (this.isReadyToFire && dist < 900) {
                // Fire
                this.primaryFire(time);
            } else if (!this.readyToFireEvent) {
                // Prepare to fire
                this.readyToFireEvent = this.scene.time.delayedCall(1500, () => {
                    // this.readyToFireEvent.hasDispatched = false;
                    this.isReadyToFire = true;
                });
            }

            // Movement logic
            this.resetMovement();

            if ((dist < 2000 && dist > 900) || (dist < 900 && dist > 700 && !this.isSleeping)) {
                // I need to be closer

                this.moveTo(x + this.jitter.x, y + this.jitter.y);
                hasMoved = true;
            } else if (dist < 700 && dist > 400 && !this.isSleeping) {
                // Perfect, stay still
                // Now I act according to my preference
                if (this.preferedMovement === Direction.Left) {
                    this.moveLeftRelative();
                    hasMoved = true;
                } else if (this.preferedMovement === Direction.Right) {
                    this.moveRightRelative();
                    hasMoved = true;
                }
            } else if (dist < 400 && !this.isSleeping) {
                // Too close; I need to back away
                const mirrorX = -(x - this.x) + this.x;
                const mirrorY = -(y - this.y) + this.y;
                this.moveTo(mirrorX, mirrorY);
                hasMoved = true;
            } else if (dist >= 2000) {
                // Target got away
                this.resetMovement();

                this.enemyTarget = null;
                this.readyToFireEvent.destroy();
                this.readyToFireEvent = null;
                this.isReadyToFire = false;
            }
        }
        if (!hasMoved) this.stoppedMoving();
    }
}
