import * as Tone from "tone";

import { GameEvent, GameListener } from "./types";

import SampleBass from "/assets/wav/Bass.wav";
import SampleKey from "/assets/wav/Melody-Key.wav";
import SampleMelody from "/assets/wav/Melody.wav";

export class GameAudio implements GameListener {
    looper?: Tone.Loop;
    players?: Tone.Players;
    fx?: Tone.Loop;
    distortion = new Tone.Distortion({
        distortion: 0.2,
    });
    enabled: Record<string, boolean> = {
        bass: true,
        key: false,
        melody: true,
    };
    nearExit = false;
    async start(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const audio = this;
        function samplesLoaded(): void {
            console.log("start the panic");

            // loop length is 2 measures
            audio.looper = new Tone.Loop((time) => {
                for (const key of Object.keys(audio.enabled)) {
                    if (audio.enabled[key]) {
                        audio.players?.player(key).start(time);
                    }
                }
            }, "2m").start(0);

            // process effects every 1/4 note
            audio.fx = new Tone.Loop((time) => {
                if (audio.nearExit) {
                    audio.setDistortion(0.6, time);
                } else {
                    audio.setDistortion(0, time);
                }
            }, "4n").start(0);

            Tone.Transport.start();
        }

        // init audio after user click
        await Tone.start();
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
        Tone.Destination.chain(this.distortion);
    }

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

    setDistortion(value: number, time: number) {
        // right away
        // this.distortion.wet.value = amount;

        // on a curve
        this.distortion.wet.exponentialRampTo(value, "4n", time);
    }
}
