import { COLORS, HEXOPTS, RESET_COLOR } from "./constants.js";
import { randNum } from "./util.js";

export function generateRandomHex(numDigits: number) {
  let resultString = "";
  for (let h = 0; h < numDigits; h++) {
    resultString += HEXOPTS[randNum(HEXOPTS.length)];
  }
  return resultString;
}

export function randColor(): string {
  return COLORS[randNum(COLORS.length)]!;
}

export function colorStringRandom(text: string) {
  return randColor() + text + RESET_COLOR;
}
