type SoundManagerConfig = {
    masterVolume: number;
    effectsVolume: number;
    musicVolume: number;
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
    constructor(scene, options?: SoundManagerConfig) {
        const defaults = {
            masterVolume: 1,
            effectsVolume: 1,
            musicVolume: 1,
            distanceThreshold: 400,
            pauseOnBlur: false,
        };
        this.options = Object.assign({}, defaults, options);

        this.scene = scene;

        scene.sound.pauseOnBlur = this.options.pauseOnBlur;
    }

    makeTarget(player) {
        this.player = player;
    }

    addSounds(type, keys) {
        if (!this.sounds[type]) {
            this.sounds[type] = keys.map((key) => this.scene.sound.add(key));
        }
    }
    addMusic(musicPlaylist, override = false) {
        if (override) {
            this.musicPlaylist = musicPlaylist;
        } else {
            this.musicPlaylist = this.musicPlaylist.concat(musicPlaylist);
        }
    }

    // https://phaser.discourse.group/t/sound-in-particular-place/2547/2
    play(type, options?) {
        console.log(
            "this.scene.cameras.main.x",
            this.scene.cameras.main.x,
            this.scene.cameras.main.y
        );
        const defaults = {
            sourceX: this.player?.x ?? this.scene.cameras.main.x,
            sourceY: this.player?.y ?? this.scene.cameras.main.y,
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
            loop,
            random,
            rareDistribution,
            checkDistance,
        } = Object.assign({}, defaults, options);

        let soundDistance = 0;
        if (checkDistance) {
            soundDistance = Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                sourceX,
                sourceY
            );
        }

        const normalizedSound = 1 - soundDistance / this.options.distanceThreshold;
        const proximityVolume = Phaser.Math.Easing.Sine.In(normalizedSound);

        // The more pitch power is, the 'heavier' the sound is
        const pitch = Math.max(pitchPower * -200, -2000);
        if (proximityVolume > 0) {
            if (random) {
                const soundsCount = this.sounds[type].length;
                // Ensure there is enough sounds
                const randomSound = Phaser.Math.Between(1, Math.max(soundsCount, rareDistribution));

                // Makes first (main) sound more likely to be played
                if (randomSound < rareDistribution - soundsCount - 1) {
                    // Play main sound
                    this.sounds[type][mainIndex].play({
                        detune: pitch,
                        volume: proximityVolume,
                        loop,
                    });
                } else {
                    // Play rare sound
                    this.sounds[type][randomSound % soundsCount].play({
                        detune: pitch,
                        volume: proximityVolume,
                        loop,
                    });
                }
            } else {
                this.sounds[type][mainIndex].play({ detune: pitch, volume });
            }
        }
    }
    // playSound(type, ) {
    //     this.sounds[type][mainIndex].play({ detune: pitch, volume });
    // }

    playMusic(trackIndex = -1) {
        if (trackIndex === -1) {
            // Play random track
            trackIndex = Phaser.Math.Between(0, this.musicPlaylist.length - 1);
        }

        this.music = this.scene.sound.add(this.musicPlaylist[trackIndex]);
        this.music.play({ volume: 0.1 });

        // Play the next track in a playlist, once finished with this one
        this.music.on("complete", () => {
            const nextTrackIndex = (trackIndex + 1) % this.musicPlaylist.length;
            this.playMusic(nextTrackIndex);
        });
    }
}
