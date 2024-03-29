import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";

import { createWorld } from "./worldBuilder";
import { loadModels } from "./modelLoader";
import { Config } from "../config";
import { checkCollisionsAndShow } from "./flotsam";
import * as LINL from "../linl";
import { GameListener, InitialContext } from "./types";

export class Start {
    // now we start making things properties
    camera?: UniversalCamera;
    cameraPos: Vector3 = new Vector3(0, Config.playerHeight, Config.scale * 10);
    dungeon?: AbstractMesh;
    flute?: AbstractMesh;
    scene?: Scene;

    // loop stuff
    listener?: GameListener;
    awayFromAll = true;

    exits: Record<string, Vector3> = {
        north: new Vector3(0, 0, -Config.worldSize),
        east: new Vector3(-Config.worldSize, 0, 0),
        west: new Vector3(Config.worldSize, 0, 0),
    };

    // MAIN GAME LOOP
    handleBeforeRender(): void {
        if (this.camera) {
            const pos = this.camera.position;
            const prevAway = this.awayFromAll;
            let newAway = true;
            for (const key of Object.keys(this.exits)) {
                const distance = Vector3.Distance(pos, this.exits[key]);
                if (distance < 42.0) {
                    newAway = false;
                    if (prevAway) {
                        this.listener?.handleEvent(
                            new CustomEvent("NearExit", {
                                detail: key,
                            })
                        );
                    }
                }
            }
            if (!prevAway && newAway) {
                //console.log("awayFromAll");
                this.listener?.handleEvent(new CustomEvent("AwayFromAllExits"));
            }
            this.awayFromAll = newAway;
        }
    }

    // MAIN GAME ENTRY POINT
    async start(ctx: InitialContext) {
        const canvas = ctx.canvas;
        const scene = ctx.scene;
        this.listener = ctx.listener;

        // this is your basic add a camera and light to a scene and set up its contents kinda thing

        // make a first person camera the user can use to navigate the scene
        this.camera = new UniversalCamera("fps", this.cameraPos, scene);
        // in case we add a jump button
        this.camera.applyGravity = true;
        // a shape around the player used to detect collisions
        this.camera.ellipsoid = new Vector3(1, Config.playerHeight / 2, 1);
        // this adds the camera/player to the collision system, otherwise you could go through walls etc
        this.camera.checkCollisions = true;

        // This attaches the camera to the canvas
        this.camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // load models and add to the scene
        const models = await loadModels(scene);
        this.dungeon = models.dungeon;
        this.flute = models.flute;

        // this line approaches art. AI generated poetry at the least
        createWorld(this.dungeon, scene);

        // and an observable just before each loop tick
        scene.onBeforeRenderObservable.add(() => {
            this.handleBeforeRender();
        });

        // yup
        this.again();
    }

    // IF THE PLAYER HIT RESET
    recycle() {
        /*
        anything that has to happen to dispose old objects 
        and recreate in order to to reset to a point
        just after calling start the first time

        removeWalls()

        followed by anything that overrides defaults
        just before the game loop starts or keeps ticking
        */
        this.again();
    }

    // WHY ARE WE SHOUTING
    again() {
        // set up, assuming either start just finished or the scene is being recycled
        // point the camera to the origin but at eye level
        if (this.camera) {
            this.camera.position = this.cameraPos;
            this.camera.setTarget(new Vector3(0, Config.playerHeight, 0));
        }

        if (this.dungeon) {
            checkCollisionsAndShow(this.dungeon);
        }

        //flute.scaling.scaleInPlace(0.05);
        if (this.flute) {
            checkCollisionsAndShow(this.flute);
            this.flute.position.y = Config.playerHeight * 0.7;
            this.flute.checkCollisions = true;
            this.flute.isVisible = true;
        }

        // make some walls
        const opts: LINL.Options = {
            height: 1,
            scale: 8,
            thickness: 0.02,
        };

        // init the evil AI
        const wallDrawer = new LINL.Interpreter(opts);

        // download the MCP
        const wallDescription = wallDrawer.parse("pu fd rt pd fd 2 pu");

        // try and take over the world!
        wallDrawer.start(wallDescription);
    }

    // shh
    dispose() {
        // anything that is a class property should be disposed if that is an option
    }
}
