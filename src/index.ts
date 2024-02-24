import { Engine } from "@babylonjs/core/Engines/engine";
import { WebGPUEngine } from "@babylonjs/core/Engines/webgpuEngine";
import { getSceneModule } from "./createScene";

import "nes.css/css/nes.min.css";
import "./scss/starwarsintro.css";

import "./scss/style.scss";

/* eslint-disable */
// console warning says to include this but there's nowhere to actually use it
import { DefaultCollisionCoordinator as dcc } from "@babylonjs/core/Collisions/collisionCoordinator";

import { GameEvent, GameListener, InitialContext } from "./game/types";
import { GameAudio } from "./game/audio";
import { Start } from "./game/start";
const sideEffects = { dcc };
/* eslint-enable */

const fresh = new Start();

const listeners: GameListener[] = [];

const listener: GameListener = {
    handleEvent: (event: GameEvent) => {
        for (const delegateListener of listeners) {
            delegateListener.handleEvent(event);
        }
    },
};

const audioPlayer = new GameAudio();
// @ts-expect-error: window object
window.audioPlayer = audioPlayer;

export const babylonInit = async (): Promise<InitialContext> => {
    const createSceneModule = getSceneModule();
    const engineType =
        location.search.split("engine=")[1]?.split("&")[0] || "webgl";
    // Execute the pretasks, if defined
    await Promise.all(createSceneModule.preTasks || []);
    // Get the canvas element
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    // Generate the BABYLON 3D engine
    let engine: Engine;
    if (engineType === "webgpu") {
        const webGPUSupported = await WebGPUEngine.IsSupportedAsync;
        if (webGPUSupported) {
            // You can decide which WebGPU extensions to load when creating the engine. I am loading all of them
            await import("@babylonjs/core/Engines/WebGPU/Extensions/");
            const webgpu = (engine = new WebGPUEngine(canvas, {
                adaptToDeviceRatio: true,
                antialias: true,
            }));
            await webgpu.initAsync();
            engine = webgpu;
        } else {
            engine = new Engine(canvas, true);
        }
    } else {
        engine = new Engine(canvas, true);
    }

    // register audio events
    listeners.push(audioPlayer);

    // Create the scene
    const scene = await createSceneModule.createScene(engine, canvas);

    // JUST FOR TESTING. Not needed for anything else
    //(window as any).scene = scene;

    // Register a render loop to repeatedly render the scene
    // SRS BSNS ONLY
    engine.runRenderLoop(function () {
        scene.render();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", function () {
        engine.resize();
    });

    return { canvas, scene, listener };
};

babylonInit().then((ctx: InitialContext) => {
    // scene started rendering, everything is initialized
    fresh.start(ctx);
});
