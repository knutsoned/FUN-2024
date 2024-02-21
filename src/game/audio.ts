import * as Tone from "tone";

import { GameEvent, GameListener } from "./types";

import SampleBass from "/assets/wav/Bass.wav";
import SampleKey from "/assets/wav/Melody-Key.wav";
import SampleMelody from "/assets/wav/Melody.wav";

export class GameAudio implements GameListener {
    looper?: Tone.Loop;
    players?: Tone.Players;
    enabled: Record<string, boolean> = {
        bass: true,
        key: false,
        melody: true,
    };
    async start(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const audio = this;
        function samplesLoaded(): void {
            console.log("start the panic");
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            audio.looper = new Tone.Loop((time) => {
                for (const key of Object.keys(audio.enabled)) {
                    if (audio.enabled[key]) {
                        audio.players?.player(key).start(time);
                    }
                }
            }, "2m").start(0);
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
        );
        this.players.toDestination();
    }

    handleEvent(event: GameEvent): void {
        switch (event.type) {
            case "AwayFromAllExits":
                this.enabled.key = false;
                break;
            case "NearExit":
                this.enabled.key = true;
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
}
