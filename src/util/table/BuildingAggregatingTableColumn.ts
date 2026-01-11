import { Building } from "../../model/vic/Building";
import { Country } from "../../model/vic/Country";
import { AggregatingTableColumn } from "./AggregatingTableColumn";
import { ImageIconType } from "./ImageIconType";

export class BuildingAggregatingTableColumn extends AggregatingTableColumn<Country, Building> {

    constructor(def: string, header: string, tooltip: string, sortable: boolean, predicate: (building: Building) => boolean, valueExtractor: (building: Building) => number, predicateForNormalization: ((building: Building) => boolean) | null = null, headerImage: string | undefined = undefined, headerImageType: ImageIconType | undefined = undefined) {
        super(def, header, tooltip, sortable, predicate, valueExtractor, (building: Building) => replaceUnderscoresWithSpacesAndCapitalize(building.getName()), predicateForNormalization, headerImage, headerImageType);
    }
}

function replaceUnderscoresWithSpacesAndCapitalize(str: string): string {
    return str.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}