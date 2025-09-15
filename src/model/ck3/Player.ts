import { SimplifiedDate } from "../common/SimplifiedDate";
import { Character } from "./Character";

export class Ck3Player {

    constructor(private name: string, private currentCharacter: Character | null, private previousCharacters: Map<string,Character>) {

    }

    getName(): string {
        return this.name;
    }

    getCurrentCharacter(): Character | null {
        return this.currentCharacter;
    }

    getLastPlayedCharacter(): Character | null {
        if (this.getCurrentCharacter()) {
            return this.getCurrentCharacter();
        }
        const sortedDates = Array.from(this.previousCharacters.keys()).sort((a, b) => {
            const dateA = new Date(a).getTime();
            const dateB = new Date(b).getTime();
            return dateB - dateA;
        });
        if (sortedDates.length > 0) {
            return this.previousCharacters.get(sortedDates[0]) || null;
        }
        return null;
    }

    getPreviousCharacters() {
        return this.previousCharacters;
    }
}