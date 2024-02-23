import { PBRMaterial } from "@babylonjs/core/Materials/PBR/pbrMaterial";
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import "@babylonjs/loaders/glTF";

import { bricks } from "./jetsam";
import { Scene } from "@babylonjs/core/scene";
import { Config } from "../config";

export async function loadModels(scene: Scene) {
    // load the level (walls, doors, floor, and so far, pillars)
    let importResult = await SceneLoader.ImportMeshAsync(
        "",
        "",
        "./assets/glb/dungeon.glb",
        scene,
        undefined,
        ".glb"
    );

    // load the room structure
    const dungeon = importResult.meshes[0];

    // this is probably not idempotent so just do it this one time
    dungeon.scaling.scaleInPlace(Config.scale * 16);

    // apply a brick texture to all surfaces (except the walls for some reason)
    const brickTex = bricks("walls", scene);
    const meshes = dungeon.getChildMeshes();
    for (const mesh of meshes) {
        if (mesh.material) {
            if (mesh.material instanceof PBRMaterial) {
                //console.log(mesh.id);
                mesh.material.albedoTexture = brickTex;
            }
        }
    }

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
    flute.scaling.scaleInPlace(0.2);

    return { dungeon, flute };
}
