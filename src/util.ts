export function freeze(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
}

export function randNum(max: number) {
    return Math.floor(Math.random() * max);
}

export function toVariableName(text: string) {
    return text.toLowerCase().replace(/\s|-|'/g, '_');
}