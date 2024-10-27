import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

interface TechWord {
    value: string
}

interface TechLists {
    nouns: string[]
    verbs: string[]
    adjectives: string[]
}

export function loadWords(): TechLists {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const db = new Database(`${__dirname}/../tech_words.sqlite`, {});

    const nouns = db.prepare(`SELECT value FROM tech_nouns`).all() as TechWord[]
    const nounsList = nouns.map((obj) => obj.value)
    const verbs = db.prepare(`SELECT value FROM tech_verbs`).all() as TechWord[]
    const verbsList = verbs.map((obj) => obj.value)
    const adjectives = db.prepare(`SELECT value FROM tech_adjectives`).all() as TechWord[]
    const adjList = adjectives.map((obj) => obj.value)

    db.close();
    return {
        nouns: nounsList,
        verbs: verbsList,
        adjectives: adjList
    };
}