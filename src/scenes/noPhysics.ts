import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";

import { Container } from "../game/types";

export class NoPhysics implements CreateSceneClass {
    pillars: Container = {};
    walls: Container = {};

    // START
    createScene = async (engine: Engine): Promise<Scene> => {
        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);

        // this works as long as you don't need anything physics related but collisions
        scene.collisionsEnabled = true;

        return scene;
    };
}

export default new NoPhysics();
