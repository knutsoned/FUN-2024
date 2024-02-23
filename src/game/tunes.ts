import { Roll } from "./types";

export const pianoRoll: Roll = {
    beatLength: "4n",
    tunes: {
        main: {
            melody: [
                {
                    octave: 4,
                    probability: 0.35,
                    notes: [
                        {
                            pitch: "C",
                        },
                        {
                            pitch: "D",
                        },
                        {
                            pitch: "E",
                        },
                        {
                            pitch: "G",
                        },
                        {
                            pitch: "A",
                        },
                    ],
                },
                {
                    duration: "4n",
                    octave: 5,
                    probability: 0.55,
                    rate: 2,
                    notes: [
                        {
                            pitch: "C",
                        },
                        {
                            pitch: "E",
                        },
                        {
                            pitch: "A",
                        },
                        {
                            pitch: "G",
                            octaveDelta: -1,
                        },
                    ],
                },
                {
                    duration: "2n",
                    octave: 4,
                    probability: 0.42,
                    notes: [
                        {
                            pitch: "C",
                        },
                        {
                            pitch: "D",
                        },
                        {
                            pitch: "E",
                        },
                        {
                            pitch: "A",
                        },
                    ],
                },
            ],
            rhythm: [
                {
                    triggers: [
                        {
                            sound: {
                                pitch: "D4",
                                voice: "kick",
                            },
                        },
                        {
                            offset: 1,
                            probability: 0.75,
                            sound: {
                                pitch: "A4",
                                voice: "kick",
                            },
                        },
                        {
                            offset: 2,
                            probability: 0.66,
                            sound: {
                                pitch: "D4",
                                voice: "kick",
                            },
                        },
                        {
                            offset: 3.5,
                            probability: 0.42,
                            sound: {
                                pitch: "D4",
                                voice: "kick",
                            },
                        },
                    ],
                },
            ],
        },
    },
};
