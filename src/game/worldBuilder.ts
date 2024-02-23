import { Vector3 } from "@babylonjs/core/Maths/math.vector";
/*
import { Quaternion } from "@babylonjs/core/Maths/math.vector";
import {
    PhysicsShapeBox,
    //PhysicsShapeSphere,
} from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
*/
import { Scene } from "@babylonjs/core/scene";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
//import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";

import { Config } from "../config";
import { Container } from "./types";

// make an invisible wall
function createBound(
    name: string,
    position: Vector3,
    rotate: boolean,
    scene: Scene
): Mesh {
    const bound = CreateBox(
        "bound " + name,
        {
            width: Config.worldSize * 2,
            height: Config.worldSize,
            depth: 1,
        },
        scene
    );
    if (rotate) {
        bound.rotate(Vector3.Up(), Config.quarterTurn);
    }
    bound.checkCollisions = true;
    bound.isVisible = false;
    bound.position = position;
    //bound.material = this.bricks("bound", scene);
    return bound;
}

// use all lower case for the keys
function directionFrom(dir: string): string {
    switch (dir) {
        case "n":
            return "north";
        case "s":
            return "south";
        case "e":
            return "east";
        case "w":
            return "west";
    }
    return "it is very dark";
}

// hide or not
// Mesh is a kind of node but we don't know if a node is a Mesh or not
function setVisible(mesh: AbstractMesh, visible: boolean) {
    mesh.isVisible = visible;
}

// walls are named stuff like east.wall and doors are east.door
// when going through the scene mesh, this makes it easier to show and hide them
function setWallPartVisibility(
    walls: Container,
    dir: string,
    thingToSet: string,
    visible: boolean
) {
    const direction = directionFrom(dir);
    const test = direction + "." + thingToSet;
    const wall = walls[dir];
    for (const wallPart of wall.getChildMeshes()) {
        /*
          console.log("testing " + wallPart.id.toLowerCase() + " VS " + test);
          const action = visible ? "showing" : "hiding";
          */
        if (wallPart.id.toLowerCase() === test) {
            //console.log(action + " " + test);
            setVisible(wallPart, visible);
        }
    }
}

// even more convenient!
function hideWall(walls: Container, dir: string) {
    setWallPartVisibility(walls, dir, "wall", false);
}

function showWall(walls: Container, dir: string) {
    setWallPartVisibility(walls, dir, "wall", true);
}

function hideDoor(walls: Container, dir: string) {
    setWallPartVisibility(walls, dir, "door", false);
}

function showDoor(walls: Container, dir: string) {
    setWallPartVisibility(walls, dir, "door", true);
}

export function createWorld(dungeon: AbstractMesh, scene: Scene) {
    // loading a model with a ground, so do we need this?

    /*
    // Our built-in 'ground' shape.
    const ground = CreateGround(
        "ground",
        { width: Config.scale * 2, height: Config.scale * 2 },
        scene
    );
    // use this ground to keep the player from falling and use the ground from the room for rendering
    ground.checkCollisions = true;
    ground.isVisible = false;

    // Create a static box shape
    const groundShape = new PhysicsShapeBox(
        new Vector3(0, 0, 0),
        Quaternion.Identity(),
        new Vector3(Config.scale * 2, 0.1, Config.scale * 2),
        scene
    );

    // Create a body and attach it to the ground. Set it as Static.
    const groundBody = new PhysicsBody(
        ground,
        PhysicsMotionType.STATIC,
        false,
        scene
    );

    // Set material properties
    groundShape.material = { friction: 0.2, restitution: 0.8 };

    // Associate the body and the shape
    groundBody.shape = groundShape;

    // Set the mass to 0
    groundBody.setMassProperties({ mass: 0 });
    */

    // now that we loaded the dungeon, get the wall meshes
    const walls: Container = {};

    for (const part of dungeon.getChildren()[0].getChildren()) {
        const id = part.id.toLowerCase();
        //console.log(id);
        switch (id) {
            case "north":
            case "south":
            case "east":
            case "west":
                walls[id.charAt(0)] = part;
                break;
        }
    }

    // TODO go through the pillar^H^H^H^H^H^Hobjects and add collision detection

    // show north door and east door
    hideWall(walls, "n");
    hideDoor(walls, "n");
    showDoor(walls, "n");
    hideWall(walls, "e");
    showDoor(walls, "e");

    // show south wall and west door
    showWall(walls, "s");
    hideDoor(walls, "s");
    hideWall(walls, "w");
    showDoor(walls, "w");

    // keep the player from going over the edge
    createBound(
        "north",
        new Vector3(0, Config.scale / 2, -Config.worldSize),
        false,
        scene
    );
    createBound(
        "south",
        new Vector3(0, Config.scale / 2, Config.worldSize),
        false,
        scene
    );
    createBound(
        "east",
        new Vector3(-Config.worldSize, Config.scale / 2, 0),
        true,
        scene
    );
    createBound(
        "west",
        new Vector3(Config.worldSize, Config.scale / 2, 0),
        true,
        scene
    );
}
