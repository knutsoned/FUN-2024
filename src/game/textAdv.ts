import { Level, Player, Room, World } from "./types";

const bottomLeft: Room = {
    id: "room1",
    name: "broom closet",
    desc: "a dark and decrepit narrow passage around the corner",
    portals: [
        {
            name: "exit door",
            dest: "room4",
            dir: "n",
        },
        {
            name: "machine",
            dest: "room2",
            dir: "e",
        },
    ],
};

const bottomMid: Room = {
    id: "room2",
    name: "an ancient looking (definitely pre-1990) computer with two slots",
    desc: "In the distance, there are 3 ways to proceed. One door leads outside, to the ottoman horde. The other doors lead deeper into the complex. Solve the puzzle and stay alive. And turn off the ottoman autoship, those notifications are driving me up the wall!",
    portals: [
        {
            name: "closet",
            dest: "room1",
            dir: "w",
        },
        {
            name: "central hall",
            dest: "room5",
            dir: "n",
        },
        {
            name: "storage",
            dest: "room3",
            dir: "e",
        },
    ],
};

const bottomRight: Room = {
    id: "room3",
    name: "storage room",
    desc: "a locked area with a KEEP OUT sign on the door",
    portals: [
        {
            name: "machine",
            dest: "room2",
            dir: "w",
        },
        {
            name: "east exit",
            dest: "room6",
            dir: "n",
        },
    ],
};

const midLeft: Room = {
    id: "room4",
    name: "west exit",
    desc: "a door that may or may not lead outside",
    portals: [
        {
            name: "security desk",
            dest: "room7",
            dir: "n",
        },
        {
            name: "closet",
            dest: "room3",
            dir: "s",
        },
        {
            name: "goOutside",
            action: "WestExit",
            dir: "w",
        },
    ],
};

const midMid: Room = {
    id: "room5",
    name: "central hall",
    desc: "a hall connecting all the exit doors and the machine",
    portals: [
        {
            name: "north exit",
            dest: "room8",
            dir: "n",
        },
        {
            name: "east exit",
            dest: "room6",
            dir: "e",
        },
        {
            name: "machine",
            dest: "room2",
            dir: "s",
        },
    ],
};

const midRight: Room = {
    id: "room6",
    name: "east exit",
    desc: "a door that may or may not lead outside",
    portals: [
        {
            name: "lounge",
            dest: "room9",
            dir: "n",
        },
        {
            name: "storage room",
            dest: "room3",
            dir: "s",
        },
        {
            name: "central hall",
            dest: "room5",
            dir: "w",
        },
        {
            name: "goOutside",
            action: "EastExit",
            dir: "e",
        },
    ],
};

const topLeft: Room = {
    id: "room7",
    name: "security desk",
    desc: "a dusty old desk",
    portals: [
        {
            name: "north exit",
            dest: "room8",
            dir: "e",
        },
        {
            name: "west exit",
            dest: "room4",
            dir: "s",
        },
    ],
};

const topMid: Room = {
    id: "room8",
    name: "north exit",
    desc: "a door that may or may not lead outside",
    portals: [
        {
            name: "security desk",
            dest: "room7",
            dir: "w",
        },
        {
            name: "central hall",
            dest: "room5",
            dir: "s",
        },
        {
            name: "goOutside",
            action: "NorthExit",
            dir: "n",
        },
    ],
};

const topRight: Room = {
    id: "room9",
    name: "lounge",
    desc: "a well-appointed lounge with ample seating",
    portals: [
        {
            name: "room6",
            dest: "bottomMid",
            dir: "s",
        },
    ],
};

const start: Room = {
    id: "start",
    name: "",
    desc: "You begin in the lobby of the SoffiTech building. ",
    portals: [
        {
            name: "begin",
            dest: "room2",
            dir: "n",
        },
    ],
};

export function createWorld(player: Player): World {
    const world: World = {
        players: [player],
        rooms: [
            start,
            bottomLeft,
            bottomMid,
            bottomRight,
            midLeft,
            midMid,
            midRight,
            topLeft,
            topMid,
            topRight,
        ],
        start: "start",
    };

    return world;
}

export function createLevel(player: Player): Level {
    const world = createWorld(player);
    return { player, world };
}
