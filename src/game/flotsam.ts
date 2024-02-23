import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";

export function checkCollisionsAndShow(parent: AbstractMesh) {
    parent.checkCollisions = true;
    for (const mesh of parent.getChildMeshes()) {
        mesh.checkCollisions = true;
    }
    parent.isVisible = true;
}
