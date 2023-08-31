import type { OutEvents } from "~/game/core/";
import { GameClient } from "~/game/core/GameClient/GameClient";

import map_11 from "~/assets/maps/map_1-1.jpg";
import map_11_json from "~/assets/maps/map_1-1.json";
import map_12 from "~/assets/maps/map_1-2.webp";
import map_12_json from "~/assets/maps/map_1-2.json";
import F5S4 from "~/assets/ships/F5S4.png";
import F5S4N from "~/assets/ships/F5S4N.png";
import F5S4_json from "~/assets/ships/F5S4.json";

import laser22 from "~/assets/weapons/lasers/laser-22.5.webp";
import laser22N from "~/assets/weapons/lasers/laser-22.5-normal.webp";
import laser22_json from "~/assets/weapons/lasers/laser-22.5.json";
import laser45 from "~/assets/weapons/lasers/laser-45.webp";
import laser45N from "~/assets/weapons/lasers/laser-45-normal.webp";
import laser45_json from "~/assets/weapons/lasers/laser-45.json";
import laser90 from "~/assets/weapons/lasers/laser-90.webp";
import laser90N from "~/assets/weapons/lasers/laser-90-normal.webp";
import laser90_json from "~/assets/weapons/lasers/laser-90.json";

import laser from "~/assets/weapons/lasers/spr_bullet_strip02.png";
import laser_json from "~/assets/weapons/lasers/spr_bullet_strip02-red.json";
import gatling from "~/assets/weapons/gatling/projectile.webp";
import gatling_json from "~/assets/weapons/gatling/projectile.json";
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
import missing from "~/assets/missing.webp";

interface TextureWithJsonOptions {
    type?: "image" | "atlas" | "spritesheet";
    jsonPath: string;
    texturePath: string;
    nTexturePath?: string;
    spritesheetFrameOptions?: Phaser.Types.Loader.FileTypes.ImageFrameConfig;
}

export class PreloadScene extends Phaser.Scene {
    declare game: GameClient | Phaser.Game;

    get isClient() {
        return this.game instanceof GameClient;
    }

    get isServer() {
        return !this.isClient;
    }

    constructor() {
        super("PreloadScene");
    }

    emitOut(event: keyof OutEvents, status: any) {
        if (this.game instanceof GameClient) {
            this.game.outEmitter.emit(event, status);
        }
    }
    loadTextureWithJson(key: string, options: TextureWithJsonOptions) {
        const defaultOptions: Partial<TextureWithJsonOptions> = {
            type: "image",
            nTexturePath: null,
            spritesheetFrameOptions: null,
        };
        const mergedOptions = { ...defaultOptions, ...options };
        const { type, jsonPath, texturePath, nTexturePath, spritesheetFrameOptions } =
            mergedOptions;
        this.load.json(key + "_json", jsonPath);

        if (this.isClient) {
            if (type === "image") {
                this.load.image(key, texturePath);
            } else if (type === "atlas") {
                this.load.atlas({
                    key,
                    textureURL: texturePath,
                    ...(nTexturePath && { normalMap: nTexturePath }),
                    atlasURL: jsonPath,
                });
            } else if (type === "spritesheet") {
                this.load.spritesheet(key, texturePath, spritesheetFrameOptions);
            }
        }
    }

    // TODO (in preload)
    // this.loadTextureWithJson
    // this.loadImage
    // ...
    // and then use as
    // https://phaser.discourse.group/t/creating-sprite-from-texture-atlas-without-using-load-atlas/3464/2
    // this.getAtlasOrJson
    preload() {
        // Maps
        this.emitOut("loading", { name: "Maps", progress: 1 });
        this.loadTextureWithJson("map_1-1", { jsonPath: map_11_json, texturePath: map_11 });
        this.loadTextureWithJson("map_1-2", { jsonPath: map_12_json, texturePath: map_12 });

        // Ships
        this.emitOut("loading", { name: "Ships", progress: 2 });
        this.loadTextureWithJson("F5S4", {
            type: "atlas",
            jsonPath: F5S4_json,
            texturePath: F5S4,
            nTexturePath: F5S4N,
        });
        // Weapons
        this.emitOut("loading", { name: "Weapons", progress: 3 });
        this.loadTextureWithJson("laser", {
            type: "spritesheet",
            jsonPath: laser_json,
            texturePath: laser,
            spritesheetFrameOptions: {
                frameWidth: 95,
                frameHeight: 68,
            },
        });
        this.loadTextureWithJson("gatling", {
            jsonPath: gatling_json,
            texturePath: gatling,
        });

        this.loadTextureWithJson("laser22", {
            type: "atlas",
            jsonPath: laser22_json,
            texturePath: laser22,
            nTexturePath: laser22N,
        });
        this.loadTextureWithJson("laser45", {
            type: "atlas",
            jsonPath: laser45_json,
            texturePath: laser45,
            nTexturePath: laser45N,
        });
        this.loadTextureWithJson("laser90", {
            type: "atlas",
            jsonPath: laser90_json,
            texturePath: laser90,
            nTexturePath: laser90N,
        });

        if (this.isClient) {
            // Modules
            this.emitOut("loading", { name: "Modules", progress: 4 });
            this.load.image("shield", shield);
            // Effects
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

            // Other
            this.load.image("missing", missing);
        }
        this.emitOut("loading", {
            name: "Preload Scene",
            progress: 95,
        });
    }

    create() {
        if (this.isClient) {
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
        }

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
