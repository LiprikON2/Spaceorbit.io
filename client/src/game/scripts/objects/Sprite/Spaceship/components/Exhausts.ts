export class Exhausts {
    scene;
    ship;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    exhaustOrigins: { x: number; y: number }[];
    isSoundInit = false;
    // Since origins are sorted in increasing order, we ensure symmetry by using a particular pattern of activation engines
    // "have N engine slots": list of indices when have 1 of them installed, have 2 engines installed, have 3 engines...
    exhaustOriginCountPattern = {
        "1": [[0]],
        "3": [[1], [0, 2], [0, 1, 2]],
        "5": [[2], [1, 3], [0, 2, 4], [0, 1, 3, 4], [0, 1, 2, 3, 4]],
        "7": [
            [3],
            [2, 4],
            [2, 3, 4],
            [1, 2, 4, 5],
            [1, 2, 3, 4, 5],
            [0, 1, 2, 4, 5, 6],
            [0, 1, 2, 3, 4, 5, 6],
        ],
    };

    get pattern() {
        return this.exhaustOriginCountPattern[this.slotCount + 1][this.engineCount - 1];
    }
    get engineCount() {
        return this.exhaustEmitters.length;
    }
    get slotCount() {
        return this.exhaustOrigins.length - 1;
    }

    constructor(scene, ship, exhaustOrigins) {
        this.scene = scene;
        this.ship = ship;
        // Sort by x value, from lowest to highest
        this.exhaustOrigins = exhaustOrigins.sort(({ x: a }, { x: b }) => a - b);

        this.createExhaust(true);
        this.updateExhaustPosition();
    }

    placeEngine(type, slot) {
        let doesFit = false;
        if (slot <= this.slotCount - 1) {
            if (type === "engine") {
                this.createExhaust();
                doesFit = true;
            } else if (!type && slot < this.engineCount - 1) {
                this.removeExhaust();
            }
        }

        return doesFit;
    }

    createExhaust(silent = false) {
        const hasEmptyEngineSlot = this.engineCount <= this.slotCount;

        if (hasEmptyEngineSlot) {
            const exhaustParticles = this.scene.add
                .particles("exhaust")
                .setDepth(this.ship.depth - 1);
            const exhaustEmitter = exhaustParticles.createEmitter({
                follow: this.ship,
                x: 0,
                y: 0,
                quantity: 5,
                frequency: 1,
                scale: { start: 0.1, end: 0.06 },
                lifespan: { min: 100, max: 300 },
                alpha: { start: 0.5, end: 0, ease: "Sine.easeIn" },
                radial: true,
                rotate: { min: -180, max: 180 },
                angle: { min: 30, max: 110 },
                tint: 0x89c5f0,
                blendMode: "SCREEN",
                on: false,
            });

            this.exhaustEmitters.push(exhaustEmitter);
        }
        if (!silent && !this.isSoundInit) {
            this.initExhaustSound();
        }
    }
    removeExhaust() {
        let didRemove = false;
        const willHaveAtLeastOneEngineAfterwards = this.engineCount >= 2;

        if (willHaveAtLeastOneEngineAfterwards) {
            this.exhaustEmitters.pop();
            didRemove = true;
        }
        return didRemove;
    }

    updateExhaustPosition() {
        this.exhaustEmitters.forEach((exhaustEmitter, index) => {
            const { originX, originY } = this.ship.getRotatedPoint(
                this.exhaustOrigins[this.pattern[index]]
            );
            exhaustEmitter.followOffset.set(originX, originY);
        });
    }
    // Init exhaust sound and tween
    initExhaustSound() {
        // The exhaust sound is constantly playing, tween just changes the volume
        this.scene.soundManager.playLooping("exhaust_sound_1", this.ship.id, {
            maxVolume: 0.3,
            pitchPower: this.engineCount - 1,
        });
        this.isSoundInit = true;
    }

    isRunning() {
        return this.exhaustEmitters[0].on;
    }

    stopExhaust() {
        if (this.isRunning()) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.stop());
            if (this.isSoundInit) {
                this.scene.soundManager.fadeOutLooping(this.ship.id);
            }
        }
    }

    startExhaust() {
        if (!this.isRunning()) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.start());
            if (this.isSoundInit) {
                this.scene.soundManager.fadeInLooping(this.ship.id);
            }
        }
    }
}
