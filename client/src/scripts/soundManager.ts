type SoundManagerConfig = {
    masterVolume: number;
    effectsVolume: number;
    musicVolume: number;
    effectsMute: boolean;
    musicMute: boolean;

    distanceThreshold: number;
    pauseOnBlur: boolean;
};

export default class SoundManager {
    scene;
    player;
    sounds = {};
    options: SoundManagerConfig;
    musicPlaylist: string[] = [];
    music;
    soundFade;
    loopingSounds = {};

    constructor(scene, options?: SoundManagerConfig) {
        const localStorageSettings = scene.game.settings;
        const {
            masterVolume = 1,
            effectsVolume = 0.1,
            musicVolume = 0.025,
            effectsMute = false,
            musicMute = false,
        } = localStorageSettings;
        // https://stackoverflow.com/a/37403125
        const defaults = {
            masterVolume,
            effectsVolume,
            musicVolume,
            effectsMute,
            musicMute,

            distanceThreshold: 2000,
            pauseOnBlur: false,
        };
        this.options = Object.assign({}, defaults, options);

        this.scene = scene;
        this.soundFade = this.scene.plugins.get("rexSoundFade");

        // Prevent sound mute when tabbing out
        scene.sound.pauseOnBlur = this.options.pauseOnBlur;
    }
    setVolume(key, newVolume) {
        this.options[key] = newVolume;
        this.update();
    }
    toggleMute(key) {
        this.options[key] = !this.options[key];
        this.update();
    }

    update() {
        if (this.music) {
            this.music.mute = this.options.musicMute;
            this.music.volume = this.options.masterVolume * this.options.musicVolume;
        }
        Object.keys(this.loopingSounds).forEach((UUID) => {
            const soundObj = this.loopingSounds[UUID];
            soundObj.sound.mute = this.options.effectsMute;
        });
    }

    makeTarget(player) {
        this.player = player;
        this.player.exhausts.initExhaustSound();
    }

    addSounds(type, keys) {
        if (!this.sounds[type]) {
            this.sounds[type] = keys.map((key) => this.scene.sound.add(key));
        }
    }
    addMusic(musicPlaylist, play = false, override = false) {
        if (override) {
            this.musicPlaylist = musicPlaylist;
        } else {
            this.musicPlaylist = this.musicPlaylist.concat(musicPlaylist);
        }

        if (play) {
            this.scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => this.playMusic());
        }
    }

    // https://phaser.discourse.group/t/sound-in-particular-place/2547/2
    play(type, options?) {
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
        const {
            sourceX,
            sourceY,
            mainIndex,
            volume,
            pitchPower,
            random,
            rareDistribution,
            checkDistance,
        } = Object.assign({}, defaults, options);

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
    playLooping(key, UUID, options?) {
        const defaults = {
            maxVolume: 1,
            pitchPower: 0,
        };
        const { maxVolume, pitchPower } = Object.assign({}, defaults, options);

        // The more pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        const config = {
            detune: pitch,
            volume: 0,
            mute: this.options.effectsMute,
        };

        if (!this.loopingSounds[UUID]) {
            this.loopingSounds[UUID] = {
                sound: this.scene.sound.add(key),
                settings: {
                    config,
                    maxVolume,
                    proximityVolume: 0,
                    isSilent: true,
                },
            };
        }
        this.loopingSounds[UUID].sound.play(config);
    }

    fadeOutLooping(UUID) {
        const { sound, settings } = this.loopingSounds[UUID];
        const finalVolume = settings.proximityVolume;

        this.soundFade.fadeIn(this.scene, sound, 100, 0, finalVolume);
        settings.isSilent = true;
    }
    fadeInLooping(UUID) {
        const { sound, settings } = this.loopingSounds[UUID];
        const finalVolume = settings.proximityVolume;

        this.soundFade.fadeIn(this.scene, sound, 100, finalVolume, 0);
        settings.isSilent = false;
    }

    updateLooping() {
        Object.keys(this.loopingSounds).forEach((UUID) => {
            const soundObj = this.loopingSounds[UUID];
            const soundSource = this.scene.children.getByName(UUID);

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
                // @ts-ignore
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
        this.music = this.scene.sound.add(this.musicPlaylist[trackIndex]);
        this.music.play({ volume: finalVolume, mute: this.options.musicMute });

        // Play the next track in a playlist, once finished with this one
        this.music.on("complete", () => {
            const nextTrackIndex = (trackIndex + 1) % this.musicPlaylist.length;
            this.playMusic(nextTrackIndex);
        });
    }

    normalizeVolume(distance, maxVolume = 1) {
        const minDistance = 0;
        const maxDistance = this.options.distanceThreshold;

        if (distance < maxDistance) {
            const normalizedVolume = 1 - (distance - minDistance) / (maxDistance - minDistance);
            return Phaser.Math.Easing.Sine.In(normalizedVolume * maxVolume);
        } else {
            return 0;
        }
    }
}
