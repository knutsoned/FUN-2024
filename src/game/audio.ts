import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import { Note } from "@tonejs/midi/dist/Note";
import { Time } from "tone/build/esm/core/type/Units";

import { GameEvent, GameListener } from "./types";

/*
import loopBass from "/assets/wav/Bass.wav";
import loopKey from "/assets/wav/Melody-Key.wav";
import loopMelody from "/assets/wav/Melody.wav";
*/

import trackBassline from "../mid/bass.mid";
//import trackMelody from "../mid/melody.mid";
import trackKey from "../mid/key.mid";

import sampleBass from "/assets/wav/bass.wav";
import samplePiano from "/assets/wav/piano.wav";
import sampleKick from "/assets/wav/BD909TapeSat01A03.wav";

export class GameAudio implements GameListener {
    bpm = 72;
    kickVelocity = 0.42;
    loopLength = "1m"; // 4 beat patterns
    looper?: Tone.Loop;
    players?: Tone.Players;
    bass?: Tone.Sampler;
    kick?: Tone.Sampler;
    piano?: Tone.Sampler;
    piano2?: Tone.Sampler;
    fx?: Tone.Loop;
    distortion = new Tone.Distortion({
        distortion: 0.2, // mild distortion
    });
    enabled: Record<string, boolean> = {
        bass: true,
        key: false,
        melody: true,
    };
    nearExit = false;

    async init(): Promise<void> {
        // load MIDI files
        const bassline = await this.loadMidi("bass", trackBassline);
        //const melody = await this.loadMidi("melody", trackMelody);
        const key = await this.loadMidi("key", trackKey);

        // init audio after user click
        await Tone.start();

        // load wavs as samples
        this.bass = new Tone.Sampler({
            urls: {
                //A3: sampleBass,
                E4: sampleBass,
            },
            attack: "8n",
        }).toDestination();

        this.kick = new Tone.Sampler({
            urls: {
                D4: sampleKick,
            },
            attack: 0,
        }).toDestination();

        this.piano = new Tone.Sampler({
            urls: {
                //A5: samplePiano,
                A3: samplePiano,
            },
            attack: 10,
        }).toDestination();

        this.piano2 = new Tone.Sampler({
            urls: {
                //A5: samplePiano,
                A5: samplePiano,
            },
            attack: 40,
        }).toDestination();

        /* load wavs as loops
        this.players = new Tone.Players(
            {
                bass: SampleBass,
                key: SampleKey,
                melody: SampleMelody,
            },
            {
                onerror: this.loadingError,
                onload: samplesLoaded,
            }
        ).toDestination();
        */

        // set up fx chain
        Tone.Destination.chain(this.distortion);

        // tempo
        Tone.Transport.bpm.value = this.bpm;

        Tone.loaded().then(() => {
            console.log("start the panic");

            const melodyPattern = new Tone.Pattern(
                (time, note) => {
                    if (this.piano) {
                        this.piano.triggerAttackRelease(note, "8n", time);
                    }
                },
                ["C4", "D4", "E4", "G4", "A4"],
                "randomWalk"
            );
            melodyPattern.playbackRate = 2;
            melodyPattern.probability = 0.35;

            const melodyPattern2 = new Tone.Pattern(
                (time, note) => {
                    if (this.piano) {
                        this.piano.triggerAttackRelease(note, "4n", time);
                    }
                },
                ["C5", "E5", "G4", "A5"],
                "randomWalk"
            );
            melodyPattern2.playbackRate = 2;
            melodyPattern2.probability = 0.55;

            const rhythmPattern = new Tone.Pattern(
                (time, note) => {
                    if (this.piano2) {
                        this.piano2.triggerAttackRelease(note, "2n", time);
                    }
                },
                ["C4", "D4", "E4", "A4"],
                "randomWalk"
            );
            rhythmPattern.probability = 0.42;

            // beat 3
            const beat3 = new Tone.ToneEvent((time) => {
                if (this.kick) {
                    this.kick.triggerAttack(
                        "D4",
                        time + Tone.Time("4n").toSeconds() * 2,
                        this.kickVelocity
                    );
                }
            });
            beat3.probability = 0.66;
            beat3.set({
                loop: true,
                loopEnd: "1n",
            });
            beat3.start(0);

            // maybe beat 4.5
            const beat45 = new Tone.ToneEvent((time) => {
                if (this.kick) {
                    this.kick.triggerAttack(
                        "D4",
                        time + Tone.Time("4n").toSeconds() * 3.5,
                        this.kickVelocity
                    );
                }
            });
            beat45.probability = 0.25;
            beat45.set({
                loop: true,
                loopEnd: "1n",
            });
            beat45.start(0);

            console.log("infinite improbability configured somehow");

            // loop length is 1 measure (1m)
            this.looper = new Tone.Loop((time) => {
                /*
                // play the key loop
                for (const key of Object.keys(audio.enabled)) {
                    if (audio.enabled[key]) {
                        audio.players?.player(key).start(time);
                    }
                }
                */

                // play the bass line
                if (this.bass && this.enabled.bass) {
                    //console.log("playing bass");
                    this.playMidi(this.bass, bassline, time);
                }

                if (this.kick) {
                    // beat 1
                    this.kick.triggerAttack("D4", time, this.kickVelocity);

                    // beat 2
                    this.kick.triggerAttack(
                        "A4",
                        time + Tone.Time("4n").toSeconds(),
                        this.kickVelocity
                    );
                }

                if (this.piano) {
                    // play the main melody
                    if (this.enabled.melody) {
                        //console.log("playing melody");
                        //this.playMidi(this.piano, melody, time);
                        melodyPattern.start();
                        melodyPattern2.start();
                        rhythmPattern.start();
                    }

                    // play the part at the end
                    if (this.enabled.key) {
                        //console.log("playing key");
                        this.playMidi(this.piano, key, time);
                    }
                }
            }, this.loopLength).start(0);

            // process effects every 1/4 note
            this.fx = new Tone.Loop((time) => {
                if (this.nearExit) {
                    this.setDistortion(0.6, time);
                } else {
                    this.setDistortion(0, time);
                }
            }, "8n").start(0);

            Tone.Transport.start();
        });
    }

    // react to stuff happening in the game
    handleEvent(event: GameEvent): void {
        switch (event.type) {
            case "AwayFromAllExits":
                this.nearExit = false;
                this.enabled.key = false;
                break;
            case "NearExit":
                console.log("near exit " + event.detail);
                this.nearExit = true;
                if (event.detail === "north") {
                    this.enabled.key = true;
                }
                break;
            case "StartAudio":
                this.bpm = event.detail;
        }
    }

    loadingError(err: Error): void {
        console.error(err);
    }

    async loadMidi(name: string, res: string): Promise<Midi> {
        const out = await Midi.fromUrl(res);
        out.header.setTempo(this.bpm);
        return out;
    }

    play(): void {
        Tone.Transport.start();
    }

    pause(): void {
        Tone.Transport.stop();
    }

    // play a whole midi track
    playMidi(sampler: Tone.Sampler, midi: Midi, time: Time) {
        midi.tracks.forEach((track) => {
            track.notes.forEach((note) => {
                this.playSample(sampler, note, time);
            });
        });
    }

    // play one note on a sampler
    playSample(sampler: Tone.Sampler, note: Note, time: Time) {
        sampler.triggerAttack(
            note.name,
            Tone.Time(time).toSeconds() + note.time,
            note.velocity
        );
    }

    // change the wet/dry mix of the distortion effect
    setDistortion(value: number, time: number) {
        // right away
        // this.distortion.wet.value = amount;

        // on a curve
        this.distortion.wet.exponentialRampTo(value, "4n", time);
    }
}
