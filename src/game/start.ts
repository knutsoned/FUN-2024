import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Scene } from "@babylonjs/core/scene";
import { createWorld } from "./createWorld";
import { loadModels } from "./loadModels";
import { Config } from "../config";
import { checkCollisionsAndShow } from "./jetsam";

export class Start {
    // now we start making things properties
    dungeon?: AbstractMesh;
    flute?: AbstractMesh;
    scene?: Scene;

    // MAIN GAME ENTRY POINT
    async start(scene: Scene) {
        const models = await loadModels(scene);
        this.dungeon = models.dungeon;
        this.flute = models.flute;
        createWorld(this.dungeon, scene);
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
}
