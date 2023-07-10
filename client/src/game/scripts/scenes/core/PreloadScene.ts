import type { GameClient } from "~/game/core/client/GameClient";

export class PreloadScene extends Phaser.Scene {
    game: GameClient;
    constructor() {
        super({ key: "PreloadScene" });
    }

    preload() {
        // Maps
        this.game.outEmitter.emit("loading", { name: "Maps", progress: 1 });
        this.load.atlas("map_1-1", "assets/maps/map_1-1.jpg", "assets/maps/map_1-1.json");
        this.load.atlas("map_1-2", "assets/maps/map_1-2.webp", "assets/maps/map_1-2.json");

        // Ships
        this.game.outEmitter.emit("loading", { name: "Ships", progress: 2 });
        this.load.atlas({
            key: "F5S4",
            textureURL: "assets/ships/F5S4.png",
            normalMap: "assets/ships/F5S4N.png",
            atlasURL: "assets/ships/F5S4.json",
        });

        // Weapons
        this.game.outEmitter.emit("loading", { name: "Weapons", progress: 3 });
        this.load.spritesheet("laser", "assets/weapons/lasers/spr_bullet_strip02.png", {
            frameWidth: 95,
            frameHeight: 68,
        });
        this.load.image("gatling", "assets/weapons/gatling/projectile.webp");

        // Modules
        this.game.outEmitter.emit("loading", { name: "Modules", progress: 4 });
        this.load.image("shield", "assets/ships/shield_Edit.png");

        // Effects
        // TODO is it better to use powers of 2?
        this.game.outEmitter.emit("loading", { name: "Effects", progress: 7 });
        this.load.spritesheet("particles", "assets/effects/particles_1080x1080.png", {
            frameWidth: 1080,
            frameHeight: 1080,
        });
        this.load.image("exhaust", "assets/effects/whitePuff00.png");
        this.load.spritesheet("explosion_1", "assets/effects/explosion_1.png", {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_2", "assets/effects/explosion_2.png", {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_3", "assets/effects/explosion_3.png", {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_4", "assets/effects/explosion_4.png", {
            frameWidth: 512,
            frameHeight: 512,
        });

        // UI
        this.game.outEmitter.emit("loading", { name: "UI", progress: 10 });
        this.load.image("joystick_1", "assets/ui/joystick_1.svg");
        this.load.image("joystick_2", "assets/ui/joystick_2.svg");

        // Sound Effects
        this.game.outEmitter.emit("loading", { name: "Sound Effects", progress: 15 });
        this.load.audio("laser_sound_1", "assets/weapons/lasers/laser1_short.mp3");
        this.load.audio("laser_sound_2", "assets/weapons/lasers/laser2_short.mp3");
        this.load.audio("laser_sound_3", "assets/weapons/lasers/laser3_short.mp3");
        this.load.audio("gatling_sound_1", "assets/weapons/gatling/cg1.mp3");
        this.load.audio("exhaust_sound_1", "assets/ships/thrusters_1.mp3");
        this.load.audio("hit_sound_1", "assets/ships/metal_hit_1.mp3");
        this.load.audio("hit_sound_2", "assets/ships/metal_hit_2.mp3");
        this.load.audio("explosion_sound_1", "assets/ships/explosion_3.mp3");
        this.load.audio("shield_sound_1", "assets/ships/shield_hit.mp3");
        this.load.audio("shield_down_sound_1", "assets/ships/shield_powerdown.mp3");

        // Music
        this.game.outEmitter.emit("loading", { name: "Music", progress: 20 });
        this.load.audio("track_1", "assets/music/SMP1_THEME_Cargoship.mp3");
        this.load.audio("track_2", "assets/music/SMP1_THEME_Gliese 1214b.mp3");
        this.load.audio("track_3", "assets/music/SMP1_THEME_Space caravan.mp3");
        this.load.audio("track_4", "assets/music/SMP1_THEME_Voyager.mp3");

        this.game.outEmitter.emit("loading", {
            name: "Preload Scene",
            progress: 95,
        });
    }

    create() {
        // Animations
        this.game.outEmitter.emit("loading", { name: "Animations", progress: 98 });
        this.anims.create({
            key: "explosion_1-anim",
            frames: this.anims.generateFrameNumbers("explosion_1", { start: 0, end: 63 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        });
        this.anims.create({
            key: "explosion_2-anim",
            frames: this.anims.generateFrameNumbers("explosion_2", { start: 0, end: 63 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        });
        this.anims.create({
            key: "explosion_3-anim",
            frames: this.anims.generateFrameNumbers("explosion_3", { start: 0, end: 63 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        });
        this.anims.create({
            key: "explosion_4-anim",
            frames: this.anims.generateFrameNumbers("explosion_4", { start: 0, end: 63 }),
            frameRate: 20,
            repeat: 0,
            hideOnComplete: true,
        });

        // Scenes
        const { channel } = this.game;
        if (channel) {
            this.game.outEmitter.emit("loading", {
                name: "Connecting to the server",
                progress: 99,
            });
            channel.onConnect((error) => {
                if (error) {
                    this.game.outEmitter.emit("connectionError", {
                        message: "Could not connect to the server",
                        navigateToMode: "mainMenu",
                    });
                    this.game.destroy(true);
                }

                channel.on("connection:established", () => {
                    this.game.outEmitter.emit("loading", {
                        name: "World Scene",
                        progress: 100,
                    });
                    this.scene.start("UnnamedMapScene", { channel });
                });
            });
        } else {
            this.game.outEmitter.emit("loading", { name: "World Scene", progress: 100 });
            this.scene.start("UnnamedMapScene");
        }

        /**
         * This is how you would dynamically import the mainScene class (with code splitting),
         * add the mainScene to the Scene Manager
         * and start the scene.
         * The name of the chunk would be 'mainScene.chunk.js
         * Find more about code splitting here: https://webpack.js.org/guides/code-splitting/
         */
        // let someCondition = true;
        // if (someCondition)
        //     import(/* webpackChunkName: "mainScene" */ "./mainScene").then((mainScene) => {
        //         this.scene.add("MainScene", mainScene.default, true);
        //     });
        // else console.log("The mainScene class will not even be loaded by the browser");
    }
}
