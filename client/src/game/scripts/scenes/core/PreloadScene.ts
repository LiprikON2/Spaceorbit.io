import type { OutEvents } from "~/game/core/GameManager";
import { GameClient } from "~/game/core/client/GameClient";

import map_11 from "~/assets/maps/map_1-1.jpg";
import map_11_json from "~/assets/maps/map_1-1.json";
import map_12 from "~/assets/maps/map_1-2.webp";
import map_12_json from "~/assets/maps/map_1-2.json";
import F5S4 from "~/assets/ships/F5S4.png";
import F5S4N from "~/assets/ships/F5S4N.png";
import F5S4_json from "~/assets/ships/F5S4.json";

import laser from "~/assets/weapons/lasers/spr_bullet_strip02.png";
import gatling from "~/assets/weapons/gatling/projectile.webp";
import shield from "~/assets/ships/shield_Edit.png";
import particles from "~/assets/effects/particles_1080x1080.png";
import exhaust from "~/assets/effects/whitePuff00.png";
import explosion1 from "~/assets/effects/explosion_1.png";
import explosion2 from "~/assets/effects/explosion_2.png";
import explosion3 from "~/assets/effects/explosion_3.png";
import explosion4 from "~/assets/effects/explosion_4.png";
import joystick1 from "~/assets/ui/joystick_1.svg";
import joystick2 from "~/assets/ui/joystick_2.svg";
import laser_sound_1 from "~/assets/weapons/lasers/laser1_short.mp3";
import laser_sound_2 from "~/assets/weapons/lasers/laser2_short.mp3";
import laser_sound_3 from "~/assets/weapons/lasers/laser3_short.mp3";
import gatling_sound_1 from "~/assets/weapons/gatling/cg1.mp3";
import exhaust_sound_1 from "~/assets/ships/thrusters_1.mp3";
import hit_sound_1 from "~/assets/ships/metal_hit_1.mp3";
import hit_sound_2 from "~/assets/ships/metal_hit_2.mp3";
import explosion_sound_1 from "~/assets/ships/explosion_3.mp3";
import shield_sound_1 from "~/assets/ships/shield_hit.mp3";
import shield_down_sound_1 from "~/assets/ships/shield_powerdown.mp3";
import track_1 from "~/assets/music/SMP1_THEME_Cargoship.mp3";
import track_2 from "~/assets/music/SMP1_THEME_Gliese 1214b.mp3";
import track_3 from "~/assets/music/SMP1_THEME_Space caravan.mp3";
import track_4 from "~/assets/music/SMP1_THEME_Voyager.mp3";

console.log("map_11", map_11_json);
export class PreloadScene extends Phaser.Scene {
    game: GameClient | Phaser.Game;
    constructor() {
        super("PreloadScene");
    }
    get isClient() {
        return this.game instanceof GameClient;
    }

    get isServer() {
        return !this.isClient;
    }

    emitOut(event: keyof OutEvents, status: any) {
        if (this.game instanceof GameClient) {
            this.game.outEmitter.emit(event, status);
        }
    }

    // TODO (in preload)
    // this.loadAtlas
    // this.loadImage
    // ...
    // and then use as
    // https://phaser.discourse.group/t/creating-sprite-from-texture-atlas-without-using-load-atlas/3464/2
    // this.getAtlasOrJson
    preload() {
        // Maps
        this.emitOut("loading", { name: "Maps", progress: 1 });
        if (this.isClient) {
            // this.load.atlas("map_1-1", "assets/maps/map_1-1.jpg", "assets/maps/map_1-1.json");
            // this.load.atlas("map_1-2", "assets/maps/map_1-2.webp", "assets/maps/map_1-2.json");
            this.load.image("map_1-1", map_11);
            this.load.image("map_1-2", map_12);
        }
        this.load.json("map_1-1_json", map_11_json);
        this.load.json("map_1-2_json", map_12_json);

        // Ships
        this.emitOut("loading", { name: "Ships", progress: 2 });
        // this.load.atlas({
        //     key: "F5S4",
        //     textureURL: F5S4,
        //     normalMap: F5S4N,
        //     atlasURL: F5S4_json,
        // });
        // Weapons
        this.emitOut("loading", { name: "Weapons", progress: 3 });
        this.load.spritesheet("laser", laser, {
            frameWidth: 95,
            frameHeight: 68,
        });
        this.load.image("gatling", gatling);
        // Modules
        this.emitOut("loading", { name: "Modules", progress: 4 });
        this.load.image("shield", shield);
        // Effects
        // TODO is it better to use powers of 2?
        this.emitOut("loading", { name: "Effects", progress: 7 });
        this.load.spritesheet("particles", particles, {
            frameWidth: 1080,
            frameHeight: 1080,
        });
        this.load.image("exhaust", exhaust);
        this.load.spritesheet("explosion_1", explosion1, {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_2", explosion2, {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_3", explosion3, {
            frameWidth: 512,
            frameHeight: 512,
        });
        this.load.spritesheet("explosion_4", explosion4, {
            frameWidth: 512,
            frameHeight: 512,
        });
        // UI
        this.emitOut("loading", { name: "UI", progress: 10 });
        this.load.image("joystick_1", joystick1);
        this.load.image("joystick_2", joystick2);

        if (this.isClient) {
            // Sound Effects
            this.emitOut("loading", { name: "Sound Effects", progress: 15 });
            this.load.audio("laser_sound_1", laser_sound_1);
            this.load.audio("laser_sound_2", laser_sound_2);
            this.load.audio("laser_sound_3", laser_sound_3);
            this.load.audio("gatling_sound_1", gatling_sound_1);
            this.load.audio("exhaust_sound_1", exhaust_sound_1);
            this.load.audio("hit_sound_1", hit_sound_1);
            this.load.audio("hit_sound_2", hit_sound_2);
            this.load.audio("explosion_sound_1", explosion_sound_1);
            this.load.audio("shield_sound_1", shield_sound_1);
            this.load.audio("shield_down_sound_1", shield_down_sound_1);
            // Music
            this.emitOut("loading", { name: "Music", progress: 20 });
            this.load.audio("track_1", track_1);
            this.load.audio("track_2", track_2);
            this.load.audio("track_3", track_3);
            this.load.audio("track_4", track_4);
        }
        this.emitOut("loading", {
            name: "Preload Scene",
            progress: 95,
        });
    }

    create() {
        // Animations
        this.emitOut("loading", { name: "Animations", progress: 98 });
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
        if (this.game instanceof GameClient && this.game.channel) {
            const { channel } = this.game;
            this.emitOut("loading", {
                name: "Connecting to the server",
                progress: 99,
            });
            channel.onConnect((error) => {
                if (error) {
                    this.emitOut("connectionError", {
                        message: "Could not connect to the server",
                        navigateToMode: "mainMenu",
                    });
                    this.game.destroy(true);
                }

                channel.on("connection:established", () => {
                    this.emitOut("loading", {
                        name: "World Scene",
                        progress: 100,
                    });
                    this.scene.start("UnnamedMapScene", { channel });
                });
            });
        } else {
            this.emitOut("loading", { name: "World Scene", progress: 100 });
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
