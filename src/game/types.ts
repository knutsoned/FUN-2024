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

export type RNDR = {
    random(): number;
};

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
