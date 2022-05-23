export default class Exhaust {
    scene;
    ship;
    depth;
    exhaustEmitters: Phaser.GameObjects.Particles.ParticleEmitter[] = [];
    exhaustOrigins: { x: number; y: number }[];
    exhaustTween;

    constructor(scene, ship, exhaustOrigins, depth) {
        this.scene = scene;
        this.ship = ship;
        this.depth = depth;
        this.exhaustOrigins = exhaustOrigins;

        exhaustOrigins.forEach(() => this.createExhaust());
        this.updateExhaustPosition();
    }

    createExhaust() {
        const exhaustParticles = this.scene.add.particles("exhaust").setDepth(this.depth - 1);
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
        this.initExhaustSound();
    }

    updateExhaustPosition() {
        this.exhaustEmitters.forEach((exhaustEmitter, index) => {
            const { offsetX, offsetY } = this.ship.getRotatedPoint(this.exhaustOrigins[index]);
            // @ts-ignore
            exhaustEmitter.followOffset = { x: offsetX, y: offsetY };
        });
    }
    getEngineCount() {
        return this.exhaustEmitters.length;
    }
    // Init exhaust sound and tween
    initExhaustSound(maxVolume = 0.08) {
        // The exhaust sound is constantly playing, tween just changes the volume
        this.scene.soundManager.play("exhaust", {
            pitchPower: this.getEngineCount(),
            checkDistance: false,
            loop: true,
            volume: 0,
        });
        this.exhaustTween = {
            fadeIn: this.scene.tweens.add({
                targets: this.scene.soundManager.sounds.exhaust[0],
                volume: maxVolume,
                duration: 100,
                paused: 1,
            }),
            fadeOut: this.scene.tweens.add({
                targets: this.scene.soundManager.sounds.exhaust[0],
                volume: 0,
                duration: 100,
                paused: 1,
            }),
        };
    }
    toggleExhaustSound() {
        // TODO fix popping sound in production
        if (this.exhaustEmitters[0].on) {
            this.exhaustTween.fadeIn.play();
        } else {
            this.exhaustTween.fadeOut.play();
        }
    }

    stopExhaust() {
        if (this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.stop());
            this.toggleExhaustSound();
        }
    }

    startExhaust() {
        if (!this.exhaustEmitters[0].on) {
            this.exhaustEmitters.forEach((exhaustEmitter) => exhaustEmitter.start());
            this.toggleExhaustSound();
        }
    }
}
