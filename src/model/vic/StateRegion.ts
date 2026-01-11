import { Building } from "./Building";
import { PopulationStatBlock } from "./PopulationStatBlock";

export class StateRegion {

    public static fromRawData(rawData: any, index: number, buildings: Building[]): StateRegion {
        const stateName = rawData["region"];
        const ownerCountryIndex = rawData["country"];
        const infrastructure = rawData["infrastructure"] || 0;
        const infraStructureUsage = rawData["infrastructure_usage"] || 0;
        const wage = rawData["wage"] || 0;
        let populationStatBlock = new PopulationStatBlock(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        if (rawData.pop_statistics) {
            populationStatBlock = new PopulationStatBlock(
                rawData.pop_statistics["population_lower_strata"] || 0,
                rawData.pop_statistics["population_middle_strata"] || 0,
                rawData.pop_statistics["population_upper_strata"] || 0,
                rawData.pop_statistics["population_radicals"] || 0,
                rawData.pop_statistics["population_loyalists"] || 0,
                rawData.pop_statistics["population_political_participants"] || 0,
                rawData.pop_statistics["population_salaried_workforce"] || 0,
                rawData.pop_statistics["population_subsisting_workforce"] || 0,
                rawData.pop_statistics["population_unemployed_workforce"] || 0,
                rawData.pop_statistics["population_government_workforce"] || 0,
                rawData.pop_statistics["population_laborer_workforce"] || 0,
                wage,
                rawData.pop_statistics["total_wealth"] || 0
            );
        }
        return new StateRegion(
            index,
            stateName,
            ownerCountryIndex,
            infrastructure,
            infraStructureUsage,
            wage,
            populationStatBlock,
            buildings
        );
    }

    public static fromJson(json: any): StateRegion {
        return new StateRegion(
            json.indexInSaveFile,
            json.stateName,
            json.ownerCountryIndex,
            json.infrastructure,
            json.infrastructureUsage,
            json.wage,
            PopulationStatBlock.fromJson(json.populationStatBlock),
            json.buildings.map((bJson: any) => Building.fromJson(bJson))
        );
    }

    constructor(private indexInSaveFile: number, private stateName: string, private ownerCountryIndex: number, private infrastructure: number, private infraStructureUsage: number,
        private wage: number, private populationStatBlock: PopulationStatBlock, private buildings: Building[]
    ) { }

    toJson() {
        return {
            "indexInSaveFile": this.indexInSaveFile,
            "stateName": this.stateName,
            "ownerCountryIndex": this.ownerCountryIndex,
            "infrastructure": this.infrastructure,
            "infrastructureUsage": this.infraStructureUsage,
            "wage": this.wage,
            "populationStatBlock": this.populationStatBlock.toJson(),
            "buildings": this.buildings.map(b => b.toJson())
        };
    }

    getOwnerCountryIndex() {
        return this.ownerCountryIndex;
    }

    getIndexInSaveFile() {
        return this.indexInSaveFile;
    }

    getBuildings(): Building[] {
        return this.buildings;
    }

    getPopulationStatBlock(): PopulationStatBlock {
        return this.populationStatBlock;
    }

    getName(): string {
        return this.stateName;
    }
}