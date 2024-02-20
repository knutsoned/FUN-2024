import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
//import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
//import { CreateSphere } from "@babylonjs/core/Meshes/Builders/sphereBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";
import { havokModule } from "../externals/havok";
import {
    PhysicsShapeBox,
    //PhysicsShapeSphere,
} from "@babylonjs/core/Physics/v2/physicsShape";
import { PhysicsBody } from "@babylonjs/core/Physics/v2/physicsBody";
import { PhysicsMotionType } from "@babylonjs/core/Physics/v2/IPhysicsEnginePlugin";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Node } from "@babylonjs/core/node";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Material } from "@babylonjs/core/Materials/material";
import { Mesh, PBRMaterial } from "@babylonjs/core";
import { BrickProceduralTexture } from "@babylonjs/procedural-textures/brick/brickProceduralTexture";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { CellMaterial } from "@babylonjs/materials/cell/cellMaterial";

// some people would make these class properties. I am not one of those people
const playerHeight = 20; // a player is 20 "units" tall
const quarterTurn = 1.5708; // 90 degrees in radians
const scale = playerHeight * 4; // world dimension per side in "units"

export class PhysicsSceneWithHavok implements CreateSceneClass {
    preTasks = [havokModule];

    walls: Record<string, Node> = {};

    // make a cel shading style rendering of a texture
    celShade(name: string, texture: Texture, scene: Scene): Material {
        const celShader = new CellMaterial("cel shader " + name, scene);
        celShader.diffuseTexture = texture;
        return celShader;
    }

    // procedurally generated bricks
    bricks(name: string, scene: Scene): Texture {
        const textureName = name + " brickTex";
        const brickTexture = new BrickProceduralTexture(
            textureName,
            512,
            scene
        );
        //brickTexture.numberOfBricksHeight = 40;
        brickTexture.numberOfBricksHeight = 5;
        brickTexture.brickColor = new Color3(0.42, 0.32, 0.323);
        //brickTexture.numberOfBricksWidth = 10;
        brickTexture.numberOfBricksWidth = 3;

        /*
        brickMaterial.diffuseTexture = brickTexture;
        */
        return brickTexture;
    }

    // make an invisible wall
    createBound(
        name: string,
        position: Vector3,
        rotate: boolean,
        scene: Scene
    ): Mesh {
        const bound = CreateBox(
            "bound " + name,
            {
                width: scale * 2,
                height: scale,
                depth: 1,
            },
            scene
        );
        if (rotate) {
            bound.rotate(Vector3.Up(), quarterTurn);
        }
        bound.checkCollisions = true;
        bound.isVisible = false;
        bound.position = position;
        //bound.material = this.bricks("bound", scene);
        return bound;
    }

    // use all lower case for the keys
    directionFrom(dir: string): string {
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
    setVisible(node: Node, visible: boolean, brickTex?: Texture) {
        /*
        console.log(node);
        console.log("is a mesh: " + (node instanceof Mesh));
        */
        // so we have to check it here
        if (node instanceof Mesh) {
            //console.log("SUCCESS");
            // since we checked and are certain it is a Mesh
            // TypeScript lets us treat it like one without further checking
            node.isVisible = visible;
            if (visible) {
                //console.log(node.material);
                if (brickTex && node.material instanceof PBRMaterial) {
                    // doesn't seem to have an effect
                    //console.log(brickTex);
                    node.material.emissiveTexture = brickTex;
                }
            }
        }
    }

    // walls are named stuff like east.wall and doors are east.door
    // when going through the scene mesh, this makes it easier to show and hide them
    setWallPartVisibility(
        dir: string,
        thingToSet: string,
        visible: boolean,
        brickTex?: Texture
    ) {
        const direction = this.directionFrom(dir);
        const test = direction + "." + thingToSet;
        const wall = this.walls[dir];
        for (const wallPart of wall.getChildren()) {
            /*
            console.log("testing " + wallPart.id.toLowerCase() + " VS " + test);
            const action = visible ? "showing" : "hiding";
            */
            if (wallPart.id.toLowerCase() === test) {
                //console.log(action + " " + test);
                this.setVisible(wallPart, visible, brickTex);
            }
        }
    }

    // even more convenient!
    hideWall(dir: string) {
        this.setWallPartVisibility(dir, "wall", false);
    }

    showWall(dir: string, brickTex?: Texture) {
        this.setWallPartVisibility(dir, "wall", true, brickTex);
    }

    hideDoor(dir: string) {
        this.setWallPartVisibility(dir, "door", false);
    }

    showDoor(dir: string, brickTex?: Texture) {
        this.setWallPartVisibility(dir, "door", true, brickTex);
    }

    // START
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        scene.collisionsEnabled = true;

        // set up wall texture
        const brickMaterial = this.bricks("dungeon", scene);

        // boilerplate: This creates and positions a free camera (non-mesh)
        /*
        const camera = new ArcRotateCamera(
            "my first camera",
            0,
            Math.PI / 3,
            300,
            new Vector3(0, 0, 0),
            scene
        );
        
        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());
        */

        const camera = new UniversalCamera(
            "fps",
            new Vector3(0, playerHeight, scale * 0.9),
            scene
        );
        camera.applyGravity = true;
        camera.ellipsoid = new Vector3(5, playerHeight / 2, 5);
        camera.checkCollisions = true;
        camera.setTarget(new Vector3(0, playerHeight / 2, 0));

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        /*
        // Our built-in 'sphere' shape.
        const sphere = CreateSphere(
            "sphere",
            { diameter: 2, segments: 32 },
            scene
        );

        // Move the sphere upward at 4 units
        sphere.position.y = 4;
*/
        // Our built-in 'ground' shape.
        const ground = CreateGround(
            "ground",
            { width: scale * 2, height: scale * 2 },
            scene
        );
        // use this ground to keep the player from falling and use the ground from the room for rendering
        ground.checkCollisions = true;
        ground.isVisible = false;

        // PHYSICS!
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

        // load the level (walls, doors, floor, and so far, pillars)
        let importResult = await SceneLoader.ImportMeshAsync(
            "",
            "",
            "./assets/glb/dungeon.glb",
            scene,
            undefined,
            ".glb"
        );

        const dungeon = importResult.meshes[0];
        dungeon.checkCollisions = true;
        dungeon.scaling.scaleInPlace(80);
        dungeon.showBoundingBox = true;

        // now that we loaded the dungeon, get the wall meshes
        for (const part of dungeon.getChildren()[0].getChildren()) {
            const id = part.id.toLowerCase();
            //console.log(id);
            switch (id) {
                case "north":
                case "south":
                case "east":
                case "west":
                    this.walls[id.charAt(0)] = part;
                    break;
            }
        }

        // TODO go through the pillars and add collision detection

        // show north door and east door
        this.hideWall("n");
        this.hideDoor("n");
        this.showDoor("n", brickMaterial);
        this.hideWall("e");
        this.showDoor("e", brickMaterial);

        // show south wall and west door
        this.showWall("s", brickMaterial);
        this.hideDoor("s");
        this.hideWall("w");
        this.showDoor("w", brickMaterial);

        importResult = await SceneLoader.ImportMeshAsync(
            "",
            "",
            "./assets/glb/flute.glb",
            scene,
            undefined,
            ".glb"
        );

        // look at all these glittering goods
        const flute = importResult.meshes[0];
        //flute.scaling.scaleInPlace(0.05);
        flute.position.y = playerHeight * 0.7;
        flute.checkCollisions = true;
        flute.showBoundingBox = true;

        // keep the player from going over the edge
        this.createBound(
            "north",
            new Vector3(0, scale / 2, -scale),
            false,
            scene
        );
        this.createBound(
            "south",
            new Vector3(0, scale / 2, scale),
            false,
            scene
        );
        this.createBound(
            "east",
            new Vector3(-scale, scale / 2, 0),
            true,
            scene
        );
        this.createBound("west", new Vector3(scale, scale / 2, 0), true, scene);

        /*
        // pretty much all the boilerplate code that's left til EOF
        // Create a sphere shape
        const sphereShape = new PhysicsShapeSphere(
            new Vector3(0, 0, 0),
            1,
            scene
        );

        // Sphere body
        const sphereBody = new PhysicsBody(
            sphere,
            PhysicsMotionType.DYNAMIC,
            false,
            scene
        );

        // Set shape material properties
        sphereShape.material = { friction: 0.2, restitution: 0.6 };

        // Associate shape and body
        sphereBody.shape = sphereShape;

        // And body mass
        sphereBody.setMassProperties({ mass: 1 });
        */

        // Create a static box shape
        const groundShape = new PhysicsShapeBox(
            new Vector3(0, 0, 0),
            Quaternion.Identity(),
            new Vector3(scale * 2, 0.1, scale * 2),
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

        return scene;
    };
}

export default new PhysicsSceneWithHavok();
