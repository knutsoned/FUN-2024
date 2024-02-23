import { mkAlea } from "@spissvinkel/alea";
import { RNDR } from "../game/types";

// import from https://stackoverflow.com/a/24457420
function isNumeric(value: string) {
    // ...and now we have two problems
    return /^\d+$/.test(value);
}

// LINL is not logo
export type Options = {
    height: number; // wall height in LUs (LINL Units)
    scale: number; // how many units per LU?
    prng?: RNDR;
    seed?: string; // seed for the PRNG
    thickness: number; // thickness of walls in LUs
};

// an instruction is a function that knows what a renderer can do, possibly with a value
export type Instruction = (renderer: Renderer, value?: number) => void;

// a statement is an instruction that is meant to be carried out, possibly with a value
export type Statement = {
    instruction: Instruction;
    value?: number;
};

// a full set of instructions
export interface LanguageImplementation {
    fd: Instruction;
    lt: Instruction;
    rt: Instruction;
    pu: Instruction;
    pd: Instruction;
    sr: Instruction;
}

// keep track of internal coordinates and grid system
export interface Renderer {
    x: number; // internal 2D grid in LUs
    y: number; // internal 2D grid in LUs
    dir: number; // 0 - 3 for N (noon), E (3 o'clock), S (6 o'clock), W (9 o'clock)
    penDown: boolean;
    segmentLen: number;

    brrr(statement: Statement): void;
    drawLine: () => void;
}

// actually generate stuff
export class DefaultRenderer implements Renderer {
    x: number;
    y: number;
    dir: number;
    penDown: boolean;
    segmentLen: number;

    constructor() {
        this.x = 0;
        this.y = 0;
        this.dir = 0;
        this.penDown = true; // safety off. always.
        this.segmentLen = 0;
    }

    // TODO default just logs hopefully playground-friendly code to the console
    drawLine() {
        console.log(
            "making a line of length " +
                this.segmentLen +
                " to (" +
                this.x +
                ", " +
                this.y +
                "): " +
                this.penDown
        );
    }

    brrr(statement: Statement) {
        statement.instruction(this, statement.value);
    }
}

// read the program and use a renderer to execute it
export class Interpreter implements LanguageImplementation {
    methodMap: { [name: string]: Instruction };
    opts: Options;
    prng: RNDR;
    running: boolean;
    seed: string;

    constructor(opts: Options) {
        this.seed = opts.seed ? opts.seed : new Date().toISOString();
        this.prng = opts.prng ? opts.prng : mkAlea(this.seed);
        this.opts = opts;
        this.running = false;
        this.methodMap = {
            fd: this.fd,
            lt: this.lt,
            rt: this.rt,
            pd: this.pd,
            pu: this.pu,
            sr: this.sr,
        };
    }

    changeDirection(renderer: Renderer, delta: number) {
        let newDir = renderer.dir + delta;
        if (newDir < 0) {
            newDir += 4;
        }
        if (newDir > 3) {
            newDir -= 4;
        }
        renderer.dir = newDir;
    }

    fd = (renderer: Renderer, amt = 1) => {
        // don't call drawline in case we are doing another fd right after this
        if (renderer.penDown) {
            renderer.segmentLen += amt;
        }
        switch (renderer.dir) {
            case 0:
                renderer.y += amt;
                break;
            case 1:
                renderer.x += amt;
                break;
            case 2:
                renderer.y -= amt;
                break;
            case 3:
                renderer.x -= amt;
        }
    };

    // only 90 and 180 are currently useful values for deg
    lt = (renderer: Renderer, deg = 90) => {
        if (deg === 90) {
            this.changeDirection(renderer, -1);
        }
        if (deg === 180) {
            this.changeDirection(renderer, -2);
        }

        // flush the line drawer
        renderer.drawLine();
    };

    rt = (renderer: Renderer, deg = 90) => {
        if (deg === 90) {
            this.changeDirection(renderer, 1);
        }
        if (deg === 180) {
            this.changeDirection(renderer, 2);
        }

        // flush the line drawer
        renderer.drawLine();
    };

    pd = (renderer: Renderer) => {
        renderer.penDown = true;
    };

    pu = (renderer: Renderer) => {
        // flush the line drawer while the pen may still be down
        renderer.drawLine();

        renderer.penDown = false;
    };

    sr = (renderer: Renderer, num = 66) => {
        // num is percentage chance program will stop (eventually maybe make a skip instruction?)
        if (this.prng.random() < num / 100.0) {
            this.running = false;
        }
    };

    parse(program: string | string[]): Statement[] {
        const out: Statement[] = [];
        if (Array.isArray(program)) {
            // process the space separated tokens
            // string[] must be formatted like ['pu','fd','2']

            // check to see if numeric values need to be coalesced with their operators
            for (
                let statementInd = 0;
                statementInd < program.length;
                statementInd++
            ) {
                const statement = program[statementInd];
                //console.log(statement);
                let value = undefined;
                let makeStatement = true;
                // see if there is a numeric statements right after this one
                if (
                    statementInd < program.length - 1 &&
                    isNumeric(program[statementInd + 1])
                ) {
                    // current statement has an argument ahead, assign it
                    value = Number(program[statementInd + 1]);
                } else {
                    if (isNumeric(statement)) {
                        // current statement is an argument to previous statement, skip it
                        makeStatement = false;
                    }
                }

                // make the statement
                if (makeStatement) {
                    if (statement) {
                        const instruction = this.methodMap[statement];
                        out.push({ instruction, value });
                    }
                }
            }
        } else {
            // recursive call, replacing string with a space separated array of tokens
            return this.parse(program.split(" "));
        }

        return out;
    }

    start(program: Statement[], suppliedRenderer?: Renderer) {
        let renderer: Renderer;
        if (suppliedRenderer) {
            renderer = suppliedRenderer;
        } else {
            renderer = new DefaultRenderer();
        }
        this.running = true;
        for (let pc = 0; pc < program.length; pc++) {
            const code = program[pc];
            console.log(pc);
            //console.log(code);

            // actually execute the code
            renderer.brrr(code);
            if (!this.running) {
                break;
            }
        }
        renderer.drawLine();
    }
}
