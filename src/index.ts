#!/usr/bin/env node
// Tech Jargon Generator

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import argparse from 'argparse';

// CONSTANTS

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

/*
All color codes (for reference):
\[\033[0;30m\] # Black
\[\033[0;31m\] # Red
\[\033[0;32m\] # Green
\[\033[0;33m\] # Yellow
\[\033[0;34m\] # Blue
\[\033[0;35m\] # Purple
\[\033[0;36m\] # Cyan
\[\033[0;37m\] # White
*/

// Random Text Generation Options
const CODES = ["\x1b[0m", "\x1b[31m", "\x1b[33m", "\x1b[34m", "\x1b[36m", "\x1b[37m"];
const TRANSITIONS = [': \x1b[1;32m== task complete ==\x1b[0m', ' =>', ' ==>', ';', '...', '.', ' ->', ':', ' ::', ' |', ' ~'];
const LOADOPTS = ['Loading dependencies', 'Loading dependency', 'Executing', 'Compiling source code', 'Linking libraries', "Building"];
const HEXOPTS = '0123456789abcdef';

// FUNCTIONS

function freeze(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

function randNum(max: number) {
    return Math.floor(Math.random() * max);
}

function toVariableName(inputStr: string) {
    let ws = /\s|-|'/g;
    return inputStr.toLowerCase().replace(ws, '_');
}

function generateRandomHex(numDigits: number) {
    let resultString = '';
    for (let h = 0; h < numDigits; h++) {
        resultString += HEXOPTS[randNum(HEXOPTS.length)];
    }
    return resultString;
}

function colorStringRandom(inputString: string) {
    return CODES[randNum(CODES.length)] + inputString + "\x1b[0m";
}

// Function to get column values
function getWords(tableName: string): string[] {
    // Get the current module's file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const db = new Database(`${__dirname}/../tech_words.sqlite`, {});

    const values: string[] = db.prepare(`SELECT value FROM ${tableName}`).all().map((obj: any) => obj.value)

    // Close the database connection
    db.close();
    return values;
}

class Generator {
    nouns: string[]
    verbs: string[]
    adjectives: string[]

    // Configs
    LINES: number

    constructor() {
        this.nouns = getWords("tech_nouns")
        this.verbs = getWords("tech_verbs")
        this.adjectives = getWords("tech_adjectives")

        const parser = new argparse.ArgumentParser({ description: 'Generate tech jargon.' });

        parser.add_argument('--lines', {
            metavar: 'LINES',
            type: 'int',
            help: 'Number of lines to generate',
            default: 1000,
            required: false
        });

        let args = parser.parse_args();

        this.LINES = args.lines;
    }

    generateTechJargon(): string {
        let outerColor = CODES[randNum(CODES.length)];
        let returnString = this.adjectives[randNum(this.adjectives.length)] + " " + this.nouns[randNum(this.nouns.length)];
        if (Math.random() < CODE_PROB) {
            returnString = outerColor + this.verbs[randNum(this.verbs.length)] + " \x1b[0m" + colorStringRandom(toVariableName(returnString)) + outerColor + TRANSITIONS[randNum(TRANSITIONS.length)] + "\x1b[0m";
        }
        else {
            returnString = outerColor + this.verbs[randNum(this.verbs.length)] + " " + returnString + TRANSITIONS[randNum(TRANSITIONS.length)] + "\x1b[0m";
        }
        return returnString;
    }

    async outputTechJargon() {

        for (let k = 0; k < this.LINES; k++) {

            let roll = Math.random();

            // Prints loading bar
            if (roll < LOADING_PROB) {
                let loadingLength = MIN_LOAD_LEN + randNum(MAX_LOAD_LEN - MIN_LOAD_LEN + 1);
                process.stdout.write(CODES[randNum(CODES.length)] + LOADOPTS[randNum(LOADOPTS.length)] + ': [');
                let freezeTime = MIN_LOAD_DELAY + randNum(MAX_LOAD_DELAY - MIN_LOAD_DELAY + 1);
                for (let i = 0; i < loadingLength; i++) {
                    process.stdout.write(LOADING_CHAR);
                    await freeze(freezeTime + (LOAD_TIME_SLOWDOWN * i));
                }
                process.stdout.write('] done!\n' + '\x1b[0m');
            }
            else if (roll < LOADING_PROB + OUT_HEX_PROB) {
                console.log(colorStringRandom('Detecting system anomalies at memory address 0x' + generateRandomHex(MEM_ADDRESS_LENGTH) + '...'));
                let numBlocks = MIN_HEX_BLOCKS + randNum(MAX_HEX_BLOCKS - MIN_HEX_BLOCKS + 1);
                let fullHexLength = HEX_BLOCK_WIDTH * numBlocks + numBlocks;
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
            else {
                // Builds output string
                let numLines = MIN_NUM_LINES + randNum(MAX_NUM_LINES - MIN_NUM_LINES + 1);
                let printString = "";
                for (let i = 0; i < numLines; i++) {
                    printString += this.generateTechJargon() + " ";
                }

                // Prints output string
                console.log(printString);
            }
            await freeze(MIN_MAIN_DELAY + randNum(MAX_MAIN_DELAY - MIN_MAIN_DELAY + 1));
        }
    }
}

let generator = new Generator();

generator.outputTechJargon()

