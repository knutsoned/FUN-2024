import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import "@babylonjs/core/Physics/physicsEngineComponent";

// If you don't need the standard material you will still need to import it since the scene requires it.
import "@babylonjs/core/Materials/standardMaterial";
import { CreateSceneClass } from "../createScene";
import { havokModule } from "../externals/havok";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";

import { Container } from "../game/types";

export class PhysicsSceneWithHavok implements CreateSceneClass {
    preTasks = [havokModule];

    pillars: Container = {};
    walls: Container = {};

    // START
    createScene = async (engine: Engine): Promise<Scene> => {
        // this is your basic add a camera and light to a scene and set up its contents kinda thing

        // This creates a basic Babylon Scene object (non-mesh)
        const scene = new Scene(engine);
        scene.collisionsEnabled = true;

        // PHYSICS! (not even sure this game uses this anymore (unless I add a jump button?)
        scene.enablePhysics(null, new HavokPlugin(true, await havokModule));

        return scene;
    };
}

export default new PhysicsSceneWithHavok();
