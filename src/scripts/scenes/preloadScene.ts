export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        // Maps
        this.load.atlas("map_1-1", "assets/maps/map_1-1.jpg", "assets/maps/map_1-1.json");
        this.load.atlas("map_1-2", "assets/maps/map_1-2.webp", "assets/maps/map_1-2.json");

        // Ships
        this.load.atlas({
            key: "F5S4",
            textureURL: "assets/ships/F5S4.png",
            normalMap: "assets/ships/F5S4N.png",
            atlasURL: "assets/ships/F5S4.json",
        });
        // Weapons
        this.load.spritesheet("laser_beam", "assets/weapons/lasers/spr_bullet_strip02.png", {
            frameWidth: 95,
            frameHeight: 68,
        });
        // Particles
        // TODO is it better to use power of 2?
        this.load.spritesheet("particles", "assets/img/particles_1080x1080.png", {
            frameWidth: 1080,
            frameHeight: 1080,
        });
        this.load.image("exhaust", "assets/img/whitePuff00.png");
        // Sound Effects
        this.load.audio("laser_sound_1", "assets/weapons/lasers/laser1_short.mp3");
        this.load.audio("laser_sound_2", "assets/weapons/lasers/laser2_short.mp3");
        this.load.audio("laser_sound_3", "assets/weapons/lasers/laser3_short.mp3");
        this.load.audio("exhaust_sound_1", "assets/ships/thrusters_1.mp3");

        // Music
        this.load.audio("track_1", "assets/music/SMP1_THEME_Cargoship.mp3");
        this.load.audio("track_2", "assets/music/SMP1_THEME_Gliese 1214b.mp3");
        this.load.audio("track_3", "assets/music/SMP1_THEME_Space caravan.mp3");
        this.load.audio("track_4", "assets/music/SMP1_THEME_Voyager.mp3");
    }

    create() {
        this.scene.start("MainScene");
        // this.scene.launch("ExportParticlesdsScene");

        /**
         * This is how you would dynamically import the mainScene class (with code splitting),
         * add the mainScene to the Scene Manager
         * and start the scene.
         * The name of the chunk would be 'mainScene.chunk.js
         * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
         */
        // let someCondition = true
        // if (someCondition)
        //   import(/* webpackChunkName: "mainScene" */ './mainScene').then(mainScene => {
        //     this.scene.add('MainScene', mainScene.default, true)
        //   })
        // else console.log('The mainScene class will not even be loaded by the browser')
    }
}
