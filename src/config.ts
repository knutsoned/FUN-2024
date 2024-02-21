export const Config = {
    // some people would make these class properties. I am not one of those people
    attachControls: false,
    playerHeight: 20, // a player is 20 "units" tall
    quarterTurn: 1.5708, // 90 degrees in radians
    get scale() {
        // https://stackoverflow.com/a/4616262
        return this.playerHeight * 4; // world dimension per side in "units"
    },
};
