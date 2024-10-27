#!/usr/bin/env node

import { loadWords } from './load.js';
import { freeze, randNum, toVariableName } from './util.js';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers';

// Time Delays
const MIN_MAIN_DELAY = 1;
const MAX_MAIN_DELAY = 500;
const HEX_TIME_DELAY = 20; // Delay time between each hex byte output
const LOAD_TIME_SLOWDOWN = 3; // Determines how much loading bar delay increases. 1 = no slowdown, 2 or more = slowdown factor
const MIN_LOAD_DELAY = 1; // Determines minimum start time delay between each character of the loading bar
const MAX_LOAD_DELAY = 150; // Determines maximum start time delay between each character of the loading bar

// Probabilities
const CODE_PROB = 0.50; // Probability that the adj + noun of a line is "codified"
const LOADING_PROB = 0.10; // Probability that a loading bar is outputted
const OUT_HEX_PROB = 0.01; // Probability that a table of hex values is outputted
const HEX_COLOR_PROB = 0.20; // Probability that a hex byte in a hex table is colored

// Random generation boundaries
const MIN_LOAD_LEN = 10; // Minimum length of characters that the loading bar can be
const MAX_LOAD_LEN = 50; // Maximum length of characters that the loading bar can be
const MIN_HEX_BLOCKS = 2; // Minimum number of hex blocks generated
const MAX_HEX_BLOCKS = 4; // Maximum number of hex blocks generated
const MIN_NUM_LINES = 1; // Minimum number of tech jargon lines generated per output line
const MAX_NUM_LINES = 3; // Maximum number of tech jargon lines generated per output line

// MISC
const HEX_BLOCK_WIDTH = 4; // The length of characters that each hex block will be when outputted
const HEX_BLOCK_HEIGHT = 4; // The height of characters that each hex block will be when outputted
const HEX_BYTE_LENGTH = 4; // Number of characters that is printed out per byte of the hex table
const MEM_ADDRESS_LENGTH = 8; // Number of characters that the memory address is in the output before hex table
const LOADING_CHAR = "#"; // Character used to fill in the loading bar.

// Random Text Generation Options
const CODES = ["\x1b[0m", "\x1b[31m", "\x1b[33m", "\x1b[34m", "\x1b[36m", "\x1b[37m"];
const TRANSITIONS = [': \x1b[1;32m== task complete ==\x1b[0m', ' =>', ' ==>', ';', '...', '.', ' ->', ':', ' ::', ' |', ' ~'];
const LOADOPTS = ['Loading dependencies', 'Loading dependency', 'Executing', 'Compiling source code', 'Linking libraries', "Building"];
const HEXOPTS = '0123456789abcdef';

function generateRandomHex(numDigits: number) {
    let resultString = '';
    for (let h = 0; h < numDigits; h++) {
        resultString += HEXOPTS[randNum(HEXOPTS.length)];
    }
    return resultString;
}

function randColor(): string {
    return CODES[randNum(CODES.length)]!
}

function colorStringRandom(text: string) {
    return randColor() + text + "\x1b[0m";
}

async function printLoadingBar() {
    const loadingLength = MIN_LOAD_LEN + randNum(MAX_LOAD_LEN - MIN_LOAD_LEN + 1);
    process.stdout.write(randColor() + LOADOPTS[randNum(LOADOPTS.length)] + ': [');
    const freezeTime = MIN_LOAD_DELAY + randNum(MAX_LOAD_DELAY - MIN_LOAD_DELAY + 1);
    for (let i = 0; i < loadingLength; i++) {
        process.stdout.write(LOADING_CHAR);
        await freeze(freezeTime + (LOAD_TIME_SLOWDOWN * i));
    }
    process.stdout.write('] done!\n' + '\x1b[0m');
}

async function printHexDump() {
    console.log(colorStringRandom('Detecting system anomalies at memory address 0x' + generateRandomHex(MEM_ADDRESS_LENGTH) + '...'));
    const numBlocks = MIN_HEX_BLOCKS + randNum(MAX_HEX_BLOCKS - MIN_HEX_BLOCKS + 1);
    const fullHexLength = HEX_BLOCK_WIDTH * numBlocks + numBlocks;
    for (let i = 0; i < HEX_BLOCK_HEIGHT; i++) {
        for (let j = 0; j < fullHexLength; j++) {
            if (j % (HEX_BLOCK_WIDTH + 1) == HEX_BLOCK_WIDTH) {
                process.stdout.write("  ");
            }
            else if (Math.random() < HEX_COLOR_PROB) {
                process.stdout.write(colorStringRandom(generateRandomHex(HEX_BYTE_LENGTH) + " "));
            }
            else {
                process.stdout.write(generateRandomHex(HEX_BYTE_LENGTH) + " ");
            }
            await freeze(HEX_TIME_DELAY);
        }
        process.stdout.write('\n');
    }
    process.stdout.write('\n');
}

class Generator {
    nouns: string[]
    verbs: string[]
    adjectives: string[]

    // Configs
    LINES: number

    constructor() {
        const {nouns, verbs, adjectives} = loadWords()

        this.nouns = nouns;
        this.verbs = verbs;
        this.adjectives = adjectives;

        const argv = yargs(hideBin(process.argv))
            .options({
                l: {
                    type: 'number',
                    default: 1000,
                    alias: 'lines',
                    describe: 'Number of lines to generate'
                },
            })
            .help('h')
            .alias('h', 'help')
            .parseSync();

        this.LINES = argv.l;
    }

    generateTechJargon(): string {
        const outerColor = randColor();
        let returnString = this.adjectives[randNum(this.adjectives.length)] + " " + this.nouns[randNum(this.nouns.length)];
        if (Math.random() < CODE_PROB) {
            returnString = outerColor + this.verbs[randNum(this.verbs.length)] + " \x1b[0m" + colorStringRandom(toVariableName(returnString)) + outerColor + TRANSITIONS[randNum(TRANSITIONS.length)] + "\x1b[0m";
        }
        else {
            returnString = outerColor + this.verbs[randNum(this.verbs.length)] + " " + returnString + TRANSITIONS[randNum(TRANSITIONS.length)] + "\x1b[0m";
        }
        return returnString;
    }

    printTechJargon() {
        const numLines = MIN_NUM_LINES + randNum(MAX_NUM_LINES - MIN_NUM_LINES + 1);
        let printString = "";
        for (let i = 0; i < numLines; i++) {
            printString += this.generateTechJargon() + " ";
        }

        console.log(printString);
    }

    async outputTechJargon() {
        for (let k = 0; k < this.LINES; k++) {
            const roll = Math.random();
            if (roll < LOADING_PROB) {
                await printLoadingBar()
            }
            else if (roll < LOADING_PROB + OUT_HEX_PROB) {
                await printHexDump()
            }
            else {
                this.printTechJargon()
            }
            await freeze(MIN_MAIN_DELAY + randNum(MAX_MAIN_DELAY - MIN_MAIN_DELAY + 1));
        }
    }
}

const generator = new Generator();

generator.outputTechJargon()

