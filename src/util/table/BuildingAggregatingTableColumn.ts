import { Building } from "../../model/vic/Building";
import { Country } from "../../model/vic/Country";
import { AggregatingTableColumn } from "./AggregatingTableColumn";

export class BuildingAggregatingTableColumn extends AggregatingTableColumn<Country, Building> {

    constructor(def: string, header: string, tooltip: string, sortable: boolean, predicate: (building: Building) => boolean, valueExtractor: (building: Building) => number, predicateForNormalization: ((building: Building) => boolean) | null = null) {
        super(def, header, tooltip, sortable, predicate, valueExtractor, (building: Building) => building.getName(), predicateForNormalization);
    }
}