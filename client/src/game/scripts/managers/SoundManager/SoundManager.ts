import SoundFadePlugin from "phaser3-rex-plugins/plugins/soundfade-plugin";

import type { Spaceship } from "~/objects/Sprite/Spaceship";
import type { BaseScene } from "~/scenes/core/BaseScene";
import { Reactive } from "~/managers/components";

type PhaserSound = Phaser.Sound.BaseSound &
    Partial<{
        mute: boolean;
        volume: number;
        _fade: { _isRunning: boolean };
    }>;

interface LoopingSound {
    sound: PhaserSound;
    settings: {
        config: { detune: number; volume: number; mute: boolean };
        maxVolume: number;
        proximityVolume: number;
        isSilent: boolean;
    };
}

export class SoundManager extends Reactive {
    declare scene: BaseScene;
    player: Spaceship;
    sounds: { [name: string]: PhaserSound[] } = {};
    musicPlaylist: string[] = [];
    music: PhaserSound;
    soundFade: SoundFadePlugin;
    loopingSounds: { [entityId: string]: LoopingSound } = {};

    distanceThreshold = 2000;

    get masterVolume() {
        return this.scene.game.settings.masterVolume;
    }
    get effectsVolume() {
        return this.scene.game.settings.effectsVolume;
    }
    get musicVolume() {
        return this.scene.game.settings.musicVolume;
    }
    get effectsMute() {
        return this.scene.game.settings.effectsMute;
    }
    get musicMute() {
        return this.scene.game.settings.musicMute;
    }

    constructor(scene: BaseScene) {
        super(scene);

        this.reaction(
            () => this.masterVolume,
            () => this.updateMasterVolume()
        );
        this.reaction(
            () => this.effectsVolume,
            () => this.updateEffectsVolume()
        );
        this.reaction(
            () => this.musicVolume,
            () => this.updateMusicVolume()
        );
        this.reaction(
            () => this.effectsMute,
            () => this.updateEffectsVolume()
        );
        this.reaction(
            () => this.musicMute,
            () => this.updateMusicVolume()
        );

        this.scene = scene;
        this.soundFade = this.scene.plugins.get("rexSoundFade") as SoundFadePlugin;

        // Prevent sound mute when tabbing out
        scene.sound.pauseOnBlur = false;
    }

    updateMasterVolume() {
        this.updateEffectsVolume();
        this.updateMusicVolume();
    }

    updateMusicVolume() {
        if (this.music) {
            this.music.mute = this.musicMute;
            this.music.volume = this.masterVolume * this.musicVolume;
        }
    }

    updateEffectsVolume() {
        Object.values(this.loopingSounds).forEach(
            (loopingSound) => (loopingSound.sound.mute = this.effectsMute)
        );
    }

    setPlayer(player: Spaceship) {
        // TODO maybe use camera's center as sound POV instead?
        this.player = player;
        this.initEntity(player);
    }

    initEntity(entity: Spaceship) {
        entity.exhausts.initExhaustSound();
    }

    addSounds(name: string, keys: string[]) {
        if (!this.sounds[name]) {
            this.sounds[name] = keys.map((key) => this.scene.sound.add(key));
        }
    }

    addMusic(musicPlaylist: string[], autoplay = false, overridePlaylist = false) {
        if (overridePlaylist) this.musicPlaylist = musicPlaylist;
        else this.musicPlaylist = [...this.musicPlaylist, ...musicPlaylist];

        if (autoplay) this.scene.sound.once("unlocked", () => this.playMusic());
    }

    // https://phaser.discourse.group/t/sound-in-particular-place/2547/2
    play(type: string, options?: {}) {
        const defaults = {
            sourceX: 0,
            sourceY: 0,
            mainIndex: 0,
            volume: 1,
            pitchPower: 0,
            loop: false,
            random: false,
            // Bigger value makes rare sounds more rare
            rareDistribution: 10,
            checkDistance: true,
        };
        const mergedOptions = { ...defaults, ...options };
        const {
            sourceX,
            sourceY,
            mainIndex,
            volume,
            pitchPower,
            random,
            rareDistribution,
            checkDistance,
        } = mergedOptions;

        let distanceToSoundSource = 0;
        if (checkDistance) {
            distanceToSoundSource = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                sourceX,
                sourceY
            );
        }

        const proximityCoef = this.normalizeVolume(distanceToSoundSource, volume);
        const proximityVolume = this.masterVolume * this.effectsVolume * proximityCoef;

        // The more pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        if (proximityCoef > 0) {
            const config = {
                detune: pitch,
                volume: proximityVolume,
                mute: this.effectsMute,
            };

            if (random) {
                const soundsCount = this.sounds[type].length;
                // Ensure there is enough sounds
                const randomSoundIndex = Phaser.Math.Between(
                    1,
                    Math.max(soundsCount, rareDistribution)
                );

                // Makes first sound more likely to be played
                if (randomSoundIndex < rareDistribution - soundsCount - 1) {
                    const mainSound = this.sounds[type][mainIndex];
                    this.scene.sound.play(mainSound.key, config);
                } else {
                    const rareSound = this.sounds[type][randomSoundIndex % soundsCount];
                    this.scene.sound.play(rareSound.key, config);
                }
            } else {
                const mainSound = this.sounds[type][mainIndex];
                this.scene.sound.play(mainSound.key, config);
            }
        }
    }

    // Like music, but also is affected by proximity
    playLooping(
        key: string,
        entityId: string,
        options?: { maxVolume: number; pitchPower: number }
    ) {
        const defaults = {
            maxVolume: 1,
            pitchPower: 0,
        };
        const mergedOptions = { ...defaults, ...options };
        const { maxVolume, pitchPower } = mergedOptions;

        // The bigger pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        const config = {
            detune: pitch,
            volume: 0,
            mute: this.effectsMute,
        };

        if (!this.loopingSounds[entityId]) {
            this.loopingSounds[entityId] = {
                sound: this.scene.sound.add(key),
                settings: {
                    config,
                    maxVolume,
                    proximityVolume: 0,
                    isSilent: true,
                },
            };
        }
        this.loopingSounds[entityId].sound.play(config);
    }

    fadeOutLooping(id) {
        const { sound, settings } = this.loopingSounds[id];
        const finalVolume = settings.proximityVolume;

        this.soundFade.fadeIn(this.scene, sound, 100, 0, finalVolume);
        settings.isSilent = true;
    }
    fadeInLooping(id) {
        const { sound, settings } = this.loopingSounds[id];
        const finalVolume = settings.proximityVolume;

        this.soundFade.fadeIn(this.scene, sound, 100, finalVolume, 0);
        settings.isSilent = false;
    }

    /**
     * Updates looping sounds
     */
    update() {
        Object.keys(this.loopingSounds).forEach((id) => {
            const soundObj = this.loopingSounds[id];
            const soundSource = this.scene.entityManager.getById(id, "entity");

            let distanceToSoundSource = 0;
            if (soundSource) {
                distanceToSoundSource = Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    soundSource.x,
                    soundSource.y
                );
            }
            const proximityVolume = this.normalizeVolume(
                distanceToSoundSource,
                soundObj.settings.maxVolume
            );

            const finalVolume = this.masterVolume * this.effectsVolume * proximityVolume;

            soundObj.settings.proximityVolume = finalVolume;

            const isFading = soundObj.sound?._fade?._isRunning;
            if (!isFading && !soundObj.settings.isSilent) {
                soundObj.sound.volume = finalVolume;
            }
        });
    }

    playMusic(trackIndex = -1) {
        // todo ios music
        // https://blog.ourcade.co/posts/2020/phaser-3-web-audio-best-practices-games/
        if (trackIndex === -1) {
            // Play random track
            trackIndex = Phaser.Math.Between(0, this.musicPlaylist.length - 1);
        }

        const finalVolume = this.masterVolume * this.musicVolume;
        this.music = this.scene.sound.add(this.musicPlaylist[trackIndex]);
        this.music.play({ volume: finalVolume, mute: this.musicMute });

        // Play the next track in a playlist, once finished with this one
        this.music.on("complete", () => {
            const nextTrackIndex = (trackIndex + 1) % this.musicPlaylist.length;
            this.playMusic(nextTrackIndex);
        });
    }

    normalizeVolume(distance: number, maxVolume = 1) {
        const minDistance = 0;
        const maxDistance = this.distanceThreshold;

        if (distance < maxDistance) {
            const normalizedVolume = 1 - (distance - minDistance) / (maxDistance - minDistance);
            return Phaser.Math.Easing.Sine.In(normalizedVolume * maxVolume);
        } else return 0;
    }
}
