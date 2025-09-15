import { Character } from "./ck3/Character";
import { CK3 } from "./ck3/CK3";
import { County } from "./ck3/County";
import { Culture } from "./ck3/Culture";
import { DynastyHouse } from "./ck3/DynastyHouse";
import { Faith } from "./ck3/Faith";
import { Holding } from "./ck3/Holding";
import { Ck3Player } from "./ck3/Player";
import { ICk3Save } from "./ck3/save/ICk3Save";
import { readAllFaiths, readAllCultures, readLandedTitles, createTitle, readPlayers, readDynasties, readCountries, readAllHoldings } from "./ck3/save/Parse";
import { AbstractLandedTitle } from "./ck3/title/AbstractLandedTitle";

export class Ck3Save implements ICk3Save {

    // raw character data to avoid object instantiation at init
    private livingCharacters: any;
    private deadUnprunableCharacters: any;

    private players: Ck3Player[] = [];
    private faiths: Faith[] = [];
    private cultures: Culture[] = [];
    private landedTitles: AbstractLandedTitle[] = [];
    private dynastyHouses: DynastyHouse[] = [];
    private counties: County[] = [];
    private index2Holding: Map<string, Holding> = new Map<string, Holding>();

    private titleKey2Index = new Map<string, number>();

    private cachedCharacters = new Map<string, Character>();

    static fromRawData(data: any, ck3: CK3): Ck3Save {
        const save = new Ck3Save(ck3, data.date);
        save.initialize(data);
        return save;
    }

    private constructor(private ck3: CK3, private ingameDate: Date) {

    }

    private initialize(data: any) {
        this.players = readPlayers(data, (id, data) => this.findDataAndCreateCharacter(data, id));
        this.faiths = readAllFaiths(data);
        this.cultures = readAllCultures(data);
        this.counties = readCountries(data, this, this.ck3);
        this.landedTitles = readLandedTitles(data, (titleData) => createTitle(titleData, this, this.ck3));
        this.index2Holding = readAllHoldings(data, this, this.ck3);
        this.landedTitles.forEach((title, index) => {
            this.titleKey2Index.set(title.getKey(), index);
        });
        this.dynastyHouses = readDynasties(data, this);
        this.livingCharacters = data.living || {};
        this.deadUnprunableCharacters = data.dead_unprunable || {};
    }

    public getCK3(): CK3 {
        return this.ck3;
    }

    findDataAndCreateCharacter(data: any, characterId: string): Character | null {
        const index = parseInt(characterId);
        let charData = null;
        if (data.living && data.living[index]) {
            charData = data.living[index];
        } else if (data.dead_unprunable && data.dead_unprunable[index]) {
            charData = data.dead_unprunable[index];
        } else if (data.dead_prunable && data.dead_prunable[index]) {
            charData = data.dead_prunable[index];
        } else {
            console.warn(`Character with ID ${characterId} not found in living or dead data.`);
            return null;
        }
        const char = Character.fromRawData(characterId, charData, this, this.ck3);
        this.cachedCharacters.set(characterId, char);
        return char;
    }

    getCharacter(characterId: number) {
        if (this.cachedCharacters.has("" + characterId)) {
            return this.cachedCharacters.get("" + characterId)!;
        }
        return this.findDataAndCreateCharacter({
            living: this.livingCharacters,
            dead_unprunable: this.deadUnprunableCharacters,
        }, "" + characterId,);
    }

    getDynastyHouse(houseId: number): DynastyHouse | null {
        if (this.dynastyHouses[houseId]) {
            return this.dynastyHouses[houseId];
        }
        return null;
    }

    public getDynastyHouseAndDynastyData(houseId: number) {
        throw new Error("Method not implemented.");
    }

    getLandedTitles() {
        return this.landedTitles;
    }

    getCurrentIngameDate(): Date {
        return this.ingameDate;
    }

    getTitleByIndex(index: number): AbstractLandedTitle | null {
        if (index < 0 || index >= this.landedTitles.length) {
            console.error("Invalid title index:", index, "length:", this.landedTitles.length);
            return null;
        }
        return this.landedTitles[index];
    }

    getHeldTitles(character: Character): AbstractLandedTitle[] {
        return this.landedTitles.filter(title => title.getHolder() != null && title.getHolder()!.getCharacterId() === character.getCharacterId());
    }

    getPlayerNameByCharacterId(characterId: string): string | null {
        throw new Error("Method not implemented.");
    }

    getCulture(cultureIndex: number): Culture {
        if (cultureIndex < 0 || cultureIndex >= this.cultures.length) {
            throw new Error("Invalid culture index: " + cultureIndex + ". Expected [0, " + (this.cultures.length - 1) + "]");
        }
        return this.cultures[cultureIndex];
    }

    getFaith(faithIndex: number): Faith {
        if (faithIndex < 0 || faithIndex >= this.faiths.length) {
            throw new Error("Invalid faith index: " + faithIndex + ". Expected [0, " + (this.faiths.length - 1) + "]");
        }
        return this.faiths[faithIndex];
    }

    getPlayers(): Ck3Player[] {
        return this.players;
    }

    getLivingCharactersFiltered(filter: (character: Character) => boolean): Character[] {
        const result = [];
        for (const charId in this.livingCharacters) {
            const char = this.getCharacter(parseInt(charId));
            if (!char) {
                console.warn("Character with ID " + charId + " unable to be created/found.");
                continue;
            }
            if (filter(char)) {
                result.push(char);
            }
        }
        return result;
    }

    getHolding(index: string) {
        if (this.index2Holding.has(index)) {
            return this.index2Holding.get(index)!;
        }
        return null;
    }

    getTitle(key: string): AbstractLandedTitle {
        const index = this.titleKey2Index.get(key);
        if (index !== undefined) {
            return this.landedTitles[index];
        }
        throw new Error(`Title with key ${key} not found.`);
    }

    getCounties(): County[] {
        return this.counties;
    }
}
