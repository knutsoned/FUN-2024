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
import trackMelody from "../mid/melody.mid";
import trackKey from "../mid/key.mid";

import sampleBass from "/assets/wav/bass.wav";
import samplePiano from "/assets/wav/piano.wav";

export class GameAudio implements GameListener {
    loopLength = "2m"; // 8 beat patterns
    looper?: Tone.Loop;
    players?: Tone.Players;
    bass?: Tone.Sampler;
    piano?: Tone.Sampler;
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

    async start(): Promise<void> {
        // load MIDI files
        console.log(trackBassline);
        const bassline = await Midi.fromUrl(trackBassline);
        const melody = await Midi.fromUrl(trackMelody);
        const key = await Midi.fromUrl(trackKey);

        // init audio after user click
        await Tone.start();

        // load wavs as samples
        this.bass = new Tone.Sampler({
            urls: {
                A3: sampleBass,
            },
        }).toDestination();
        this.piano = new Tone.Sampler({
            urls: {
                A5: samplePiano,
            },
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

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const audio = this;
        Tone.loaded().then(() => {
            console.log("start the panic");

            // loop length is 2 measures (2m)
            audio.looper = new Tone.Loop((time) => {
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
                    console.log("playing bass");
                    this.playMidi(this.bass, bassline, time);
                }
                if (this.piano) {
                    // play the main melody
                    if (this.enabled.melody) {
                        console.log("playing melody");
                        this.playMidi(this.piano, melody, time);
                    }

                    // play the part at the end
                    if (this.enabled.key) {
                        console.log("playing key");
                        this.playMidi(this.piano, key, time);
                    }
                }
            }, this.loopLength).start(0);

            // process effects every 1/4 note
            audio.fx = new Tone.Loop((time) => {
                if (audio.nearExit) {
                    audio.setDistortion(0.6, time);
                } else {
                    audio.setDistortion(0, time);
                }
            }, "4n").start(0);

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
        }
    }

    loadingError(err: Error): void {
        console.error(err);
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
