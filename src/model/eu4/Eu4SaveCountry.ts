
export class Eu4SaveCountry {

    constructor(private tag: string, private countryData: any) {

    }

    getColor(): number[] {
        return Array.from(this.countryData.colors.map_color)
    }

    getTag(): string {
        return this.tag;
    }
}