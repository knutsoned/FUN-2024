import { Node } from "@babylonjs/core/node";
import { Scene } from "@babylonjs/core/scene";

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
