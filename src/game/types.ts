import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";
import { Time } from "tone/build/esm/core/type/Units";

// this seems handy in an abstract way
export type Container = {
    [name: string]: Node;
};

// reallly basic event handling
export interface GameEvent extends CustomEvent {}
export interface GameListener {
    handleEvent(event: GameEvent): void;
}

// returned by BJS init process
export type InitialContext = {
    canvas: HTMLCanvasElement;
    scene: Scene;
    listener: GameListener;
};

// alternative to Math.random
export type RNDR = {
    random(): number;
};

// tonejs stuff
export type Melody = {
    duration?: Time;
    notes: OneShot[];
    octave: number;
    probability?: number;
    rate?: number;
};

export type OneShot = {
    pitch: string;
    octaveDelta?: number;
    voice?: string;
};

export type Trigger = {
    probability?: number;
    sound: OneShot;
    offset?: number;
    velocity?: number;
    attack?: Time;
};

export type Rhythm = {
    triggers: Trigger[];
};

export type Roll = {
    beatLength: Time;
    tunes: Record<string, Tune>;
};

export type Tune = {
    melody?: Melody[];
    rhythm?: Rhythm[];
};

// text rpg stuff
export type Player = {
    id: string;
    name: string; // what you call yourself
    desc: string; // how others see you
};

export type Action = {
    name: string; // what to call it
    verb?: string[]; // command strings to match
};

export type Portal = {
    name: string; // what to call it
    action?: string; // action to carry out (must match Action.id)
    dest?: string; // portal may just be an action (otherwise must match Room.id)
    dir: string; // which way did he go? (what tom type after "go")
};

export type Room = {
    id: string;
    name: string; // what you call the room
    desc: string; // the first time you ever saw it
    portals?: Portal[]; // exits
};

// a world is a collection of at least 1 room and at least 1 player (may be shared)
export type World = {
    players: Player[];
    rooms: Room[];
    start: string; // starting Room.id
};

// a level is the player in a specific world
export type Level = {
    player: Player;
    world: World;
};
