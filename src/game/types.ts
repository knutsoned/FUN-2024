import { Node } from "@babylonjs/core/node";

// this seems handy in an abstract way
export type Container = {
    [name: string]: Node;
};
