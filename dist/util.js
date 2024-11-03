export function freeze(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
export function randNum(max) {
    return Math.floor(Math.random() * max);
}
export function toVariableName(text) {
    return text.toLowerCase().replace(/\s|-|'/g, "_");
}
