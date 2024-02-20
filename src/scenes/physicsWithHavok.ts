import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";

import { Container } from "../game/types";
import { Config } from "../config";
import { Start } from "../game/start";

export class PhysicsSceneWithHavok implements CreateSceneClass {
    preTasks = [havokModule];

    pillars: Container = {};
    walls: Container = {};

    fresh = new Start();

    // START
    createScene = async (
        engine: Engine,
        canvas: HTMLCanvasElement
    ): Promise<Scene> => {
        // this is your basic add a camera and light to a scene and set up its contents kinda thing

        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        scene.collisionsEnabled = true;

        const camera = new UniversalCamera(
            "fps",
            new Vector3(0, Config.playerHeight, Config.scale * 0.9),
            scene
        );
        camera.applyGravity = true;
        camera.ellipsoid = new Vector3(5, Config.playerHeight / 2, 5);
        camera.checkCollisions = true;
        camera.setTarget(new Vector3(0, Config.playerHeight / 2, 0));

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

        // PHYSICS! (not even sure this game uses this anymore (unless I add a jump button?)
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

        this.fresh.start(scene);

        return scene;
    };
}

export default new PhysicsSceneWithHavok();
