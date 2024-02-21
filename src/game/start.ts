import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";

import { createWorld } from "./worldBuilder";
import { loadModels } from "./modelLoader";
import { Config } from "../config";
import { checkCollisionsAndShow } from "./jetsam";
import { GameListener, InitialContext } from "./types";

export class Start {
    // now we start making things properties
    camera?: UniversalCamera;
    dungeon?: AbstractMesh;
    flute?: AbstractMesh;
    scene?: Scene;
    handler?: GameListener;

    exits: Record<string, Vector3> = {
        north: new Vector3(0, 0, -Config.scale),
        east: new Vector3(-Config.scale, 0, 0),
        west: new Vector3(Config.scale, 0, 0),
    };

    // MAIN GAME LOOP
    handleBeforeRender(): void {
        if (this.camera) {
            const pos = this.camera.position;
            let awayFromAll = true;
            for (const key of Object.keys(this.exits)) {
                const distance = Vector3.Distance(pos, this.exits[key]);
                if (distance < 50.0) {
                    awayFromAll = false;
                    this.handler?.handleEvent(
                        new CustomEvent("NearExit", {
                            detail: key,
                        })
                    );
                }
            }
            if (awayFromAll) {
                this.handler?.handleEvent(new CustomEvent("AwayFromAllExits"));
            }
        }
    }

    // MAIN GAME ENTRY POINT
    async start(ctx: InitialContext) {
        const canvas = ctx[0];
        const scene = ctx[1];
        this.handler = ctx[2];

        // this is your basic add a camera and light to a scene and set up its contents kinda thing

        // make a first person camera the user can use to navigate the scene
        this.camera = new UniversalCamera(
            "fps",
            new Vector3(0, Config.playerHeight, Config.scale * 0.9),
            scene
        );
        // in case we add a jump button
        this.camera.applyGravity = true;
        // a shape around the player used to detect collisions
        this.camera.ellipsoid = new Vector3(5, Config.playerHeight / 2, 5);
        // this adds the camera/player to the collision system, otherwise you could go through walls etc
        this.camera.checkCollisions = true;
        // point the camera to the origin but at eye level
        this.camera.setTarget(new Vector3(0, Config.playerHeight / 2, 0));

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
        // anything that has to happen to dispose old objects or reset objects to default values

        // followed by anything that overrides defaults just before the game loop starts or keeps ticking
        this.again();
    }

    // WHY ARE WE SHOUTING
    again() {
        // set up, assuming either start just finished or the scene is being recycled

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
    }

    // shh
    dispose() {
        // anything that is a class property should be disposed if that is an option
    }
}
