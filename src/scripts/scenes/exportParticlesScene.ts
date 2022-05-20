import eventsCenter from "../eventsCenter";
export default class ExportParticlesScene extends Phaser.Scene {
    screenWidth;
    screenHeight;
    screen;
    player;
    constructor() {
        super({ key: "ExportParticlesScene" });
    }
    init(player) {
        console.log("INIT");
        this.player = player;
    }

    create() {
        console.log("CREATE");
        this.screenWidth = Number(this.game.config.width);
        this.screenHeight = Number(this.game.config.height);

        this.screen = new Phaser.Geom.Rectangle(
            this.player.x - (this.screenWidth * 1.5) / 2,
            this.player.x - (this.screenHeight * 1.5) / 2,
            this.screenWidth * 3,
            this.screenHeight * 3
        );
        const particles = this.add.particles("particle");

        const emitter = particles.createEmitter({
            alpha: { random: [0.4, 0.9] },
            scale: { random: [0.8, 1] },
            emitZone: { source: this.screen },
            deathZone: { source: this.screen, type: "onLeave" },
            lifespan: Infinity,
            frequency: 0,
            followOffset: {
                x: -this.screenWidth / 2,
                y: -this.screenHeight / 2,
            },
        });

        // this.fillWithParticles(
        //     Number(this.game.config.width),
        //     Number(this.game.config.height),
        //     0.001
        // );

        eventsCenter.on("update-player", (player) => {
            console.log(player.xdsds);
            this.player = player;
        });
    }

    update() {
        this.screen.x = this.player.x - (this.screenWidth * 1.5) / 2;
        this.screen.y = this.player.y - (this.screenHeight * 1.5) / 2;
    }

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
