import { Angle } from "@babylonjs/core/Maths/math.path";

import { mkAlea } from "@spissvinkel/alea";

export const Config = {
    // some people would make these class properties. I am not one of those people
    attachControls: false,
    playerHeight: 2, // a player is 20 "units" tall
    prng: mkAlea(),
    seed: new Date().toISOString(),
    quarterTurn: Angle.FromDegrees(90).radians(), // 90 degrees in radians
    get scale() {
        // https://stackoverflow.com/a/4616262
        return this.playerHeight * 1; // unit = 1m
    },
    get worldSize() {
        // world dimension per side in "units"
        return this.scale * 32;
    },
};
