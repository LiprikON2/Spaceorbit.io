import { autorun } from "mobx";
import SoundFadePlugin from "phaser3-rex-plugins/plugins/soundfade-plugin";

import type { Spaceship } from "~/objects/Sprite/Spaceship";
import type { BaseScene } from "~/scenes/core/BaseScene";
import { Disposable } from "~/managers/components";

type SoundManagerConfig = {
    masterVolume: number;
    effectsVolume: number;
    musicVolume: number;
    effectsMute: boolean;
    musicMute: boolean;
};

export type VolumeKeys = "masterVolume" | "musicVolume" | "effectsVolume";
export type MuteKeys = "effectsMute" | "musicMute";

export class SoundManager extends Disposable {
    declare scene: BaseScene;
    player: Spaceship;
    sounds = {};
    options: SoundManagerConfig;
    musicPlaylist: string[] = [];
    music: Phaser.Sound.BaseSound & { mute: boolean; volume: number };
    soundFade: SoundFadePlugin;
    loopingSounds = {};

    distanceThreshold = 2000;
    constructor(scene: BaseScene) {
        super(scene);
        this.options = scene.game.settings;

        this.addDisposer(autorun(() => this.updateVolumes()));

        this.scene = scene;
        this.soundFade = this.scene.plugins.get("rexSoundFade") as SoundFadePlugin;

        // Prevent sound mute when tabbing out
        scene.sound.pauseOnBlur = false;
    }
    setVolume(key: VolumeKeys, newVolume: number) {
        this.options[key] = newVolume;
        this.updateVolumes();
    }
    toggleMute(key: MuteKeys) {
        this.options[key] = !this.options[key];
        this.updateVolumes();
    }

    updateVolumes() {
        console.log("TODO this log makes it work", this.options.masterVolume);
        if (this.music) {
            this.music.mute = this.options.musicMute;
            this.music.volume = this.options.masterVolume * this.options.musicVolume;
        }
        Object.keys(this.loopingSounds).forEach((id) => {
            const soundObj = this.loopingSounds[id];
            soundObj.sound.mute = this.options.effectsMute;
        });
    }

    setPlayer(player: Spaceship) {
        // TODO maybe use camera's center as sound POV instead?
        this.player = player;
        this.initEntity(player);
    }

    initEntity(entity: Spaceship) {
        entity.exhausts.initExhaustSound();
    }

    addSounds(type: string, keys: string[]) {
        if (!this.sounds[type]) {
            this.sounds[type] = keys.map((key) => this.scene.sound.add(key));
        }
    }
    addMusic(musicPlaylist: string[], autoplay = false, overridePlaylist = false) {
        if (overridePlaylist) {
            this.musicPlaylist = musicPlaylist;
        } else {
            this.musicPlaylist = this.musicPlaylist.concat(musicPlaylist);
        }

        if (autoplay) {
            this.scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.playMusic());
        }
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

        const proximityVolume = this.normalizeVolume(distanceToSoundSource, volume);
        const finalVolume =
            this.options.masterVolume * this.options.effectsVolume * proximityVolume;

        // The more pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        if (proximityVolume > 0) {
            const config = {
                detune: pitch,
                volume: finalVolume,
                mute: this.options.effectsMute,
            };

            if (random) {
                const soundsCount = this.sounds[type].length;
                // Ensure there is enough sounds
                const randomSound = Phaser.Math.Between(1, Math.max(soundsCount, rareDistribution));

                // TODO have on the phone a better solution
                // Makes first (main) sound more likely to be played
                if (randomSound < rareDistribution - soundsCount - 1) {
                    // Play main sound
                    const chosenSound = this.sounds[type][mainIndex];
                    this.scene.sound.play(chosenSound.key, config);
                } else {
                    // Play rare sound
                    const chosenSound = this.sounds[type][randomSound % soundsCount];
                    this.scene.sound.play(chosenSound.key, config);
                }
            } else {
                const chosenSound = this.sounds[type][mainIndex];
                this.scene.sound.play(chosenSound.key, config);
            }
        }
    }

    // Like music, but also is affected by proximity
    playLooping(key: string, id: string, options?) {
        const defaults = {
            maxVolume: 1,
            pitchPower: 0,
        };
        const { maxVolume, pitchPower } = Object.assign({}, defaults, options);

        // The bigger pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        const config = {
            detune: pitch,
            volume: 0,
            mute: this.options.effectsMute,
        };

        if (!this.loopingSounds[id]) {
            this.loopingSounds[id] = {
                sound: this.scene.sound.add(key),
                settings: {
                    config,
                    maxVolume,
                    proximityVolume: 0,
                    isSilent: true,
                },
            };
        }
        this.loopingSounds[id].sound.play(config);
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

            const finalVolume =
                this.options.masterVolume * this.options.effectsVolume * proximityVolume;

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

        const finalVolume = this.options.masterVolume * this.options.musicVolume;
        // @ts-ignore
        this.music = this.scene.sound.add(this.musicPlaylist[trackIndex]);
        this.music.play({ volume: finalVolume, mute: this.options.musicMute });

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
        } else {
            return 0;
        }
    }
}
