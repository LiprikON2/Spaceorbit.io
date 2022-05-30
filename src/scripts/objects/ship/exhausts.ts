export default class Exhausts {
    scene;
    ship;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    exhaustOrigins: { x: number; y: number }[];
    exhaustCount = 0;
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

    constructor(scene, ship, exhaustOrigins) {
        this.scene = scene;
        this.ship = ship;
        // Sort by x value, from lowest to highest
        this.exhaustOrigins = exhaustOrigins.sort(({ x: a }, { x: b }) => a - b);
        // this.scene.soundManager.addSounds("exhaust", ["exhaust_sound_1"]); //TODO

        this.createExhaust();
        this.updateExhaustPosition();
    }

    createExhaust() {
        const hasEmptyEngineSlot = this.exhaustCount + 1 <= this.exhaustOrigins.length;
        if (hasEmptyEngineSlot) {
            this.exhaustCount++;
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
    }
    getPattern() {
        const countOfEngineSlots = this.exhaustOrigins.length;
        const countOfEngines = this.exhaustCount;

        const pattern = this.exhaustOriginCountPattern[countOfEngineSlots][countOfEngines - 1];

        return pattern;
    }
    updateExhaustPosition() {
        const pattern = this.getPattern();

        this.exhaustEmitters.forEach((exhaustEmitter, index) => {
            const { offsetX, offsetY } = this.ship.getRotatedPoint(
                this.exhaustOrigins[pattern[index]]
            );
            // @ts-ignore
            exhaustEmitter.followOffset = { x: offsetX, y: offsetY };
        });
    }
    getEngineCount() {
        return this.exhaustEmitters.length;
    }
    // Init exhaust sound and tween
    initExhaustSound() {
        // The exhaust sound is constantly playing, tween just changes the volume
        this.scene.soundManager.playLoop("exhaust_sound_1", this.ship.UUID, {
            sourceX: this.ship.x,
            sourceY: this.ship.y,
            volume: 0,
            pitchPower: this.getEngineCount(),
            loop: true,
        });
        this.isSoundInit = true;
    }

    stopExhaust() {
        if (this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.stop());
            if (this.isSoundInit) {
                // this.scene.soundManager.fadeOut("exhaust", 0.08);
                // this.scene.soundManager.fadeOut("exhaust", 1);
                this.scene.soundManager.loopingSounds[this.ship.UUID].volume = 0;
            }
        }
    }

    startExhaust() {
        if (!this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.start());
            if (this.isSoundInit) {
                // this.scene.soundManager.fadeIn("exhaust", 0.08);
                // this.scene.soundManager.fadeIn("exhaust", 1);
                this.scene.soundManager.loopingSounds[this.ship.UUID].volume = 1;
            }
        }
    }
}
