import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Scene } from "@babylonjs/core/scene";
import { BrickProceduralTexture } from "@babylonjs/procedural-textures/brick/brickProceduralTexture";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

// procedurally generated bricks
export function bricks(name: string, scene: Scene): Texture {
    const textureName = name + " brickTex";
    const brickTexture = new BrickProceduralTexture(textureName, 512, scene);
    //brickTexture.numberOfBricksHeight = 40;
    brickTexture.numberOfBricksHeight = 5;
    brickTexture.brickColor = new Color3(0.42, 0.32, 0.323);
    //brickTexture.numberOfBricksWidth = 10;
    brickTexture.numberOfBricksWidth = 3;
    return brickTexture;
}

export function checkCollisionsAndShow(parent: AbstractMesh) {
    parent.checkCollisions = true;
    for (const mesh of parent.getChildMeshes()) {
        mesh.checkCollisions = true;
    }
    parent.isVisible = true;
}
