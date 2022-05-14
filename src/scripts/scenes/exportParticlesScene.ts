export default class ExportParticlesScene extends Phaser.Scene {
    constructor() {
        super({ key: "ExportParticlesScene" });
    }

    create() {
        this.fillWithParticles(
            Number(this.game.config.width),
            Number(this.game.config.height),
            0.001
        );
    }

    update() {}

    fillWithParticles(width: number, height: number, density: number) {
        for (let i = 0; i < width * height * density; i++) {
            const circle = new Phaser.Geom.Circle(
                Phaser.Math.Between(0, width),
                Phaser.Math.Between(0, height),
                Math.random()
            );
            const particle = this.add.graphics(circle);
            particle.fillStyle(0xfffffff, 1);

            particle.fillCircleShape(circle);
        }
    }
}
