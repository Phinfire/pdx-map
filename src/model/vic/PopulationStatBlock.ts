export class PopulationStatBlock {

    public static merge(blocks: PopulationStatBlock[]): PopulationStatBlock {
        let lowerStrataPopulation = 0;
        let middleStrataPopulation = 0;
        let upperStrataPopulation = 0;
        let radicals = 0;
        let loyalists = 0;
        let politicalParticipants = 0;
        let salariedWorkforce = 0;
        let subsistingWorkforce = 0;
        let unemployedWorkforce = 0;
        let governmentWorkforce = 0;
        let laborerWorkforce = 0;
        let weightedWage = 0;
        let totalWealth = 0;
        let totalPopulation = 0;
        for (const block of blocks) {
            const blockPopulation = block.lowerStrataPopulation + block.middleStrataPopulation + block.upperStrataPopulation;
            lowerStrataPopulation += block.lowerStrataPopulation;
            middleStrataPopulation += block.middleStrataPopulation;
            upperStrataPopulation += block.upperStrataPopulation;
            radicals += block.radicals;
            loyalists += block.loyalists;
            politicalParticipants += block.politicalParticipants;
            salariedWorkforce += block.salariedWorkforce;
            subsistingWorkforce += block.subsistingWorkforce;
            unemployedWorkforce += block.unemployedWorkforce;
            governmentWorkforce += block.governmentWorkforce;
            laborerWorkforce += block.laborerWorkforce;
            weightedWage += block.wage * blockPopulation;
            totalWealth += block.totalWealth;
            totalPopulation += blockPopulation;
        }
        const wage = totalPopulation > 0 ? weightedWage / totalPopulation : 0;
        return new PopulationStatBlock(
            lowerStrataPopulation,
            middleStrataPopulation,
            upperStrataPopulation,
            radicals,
            loyalists,
            politicalParticipants,
            salariedWorkforce,
            subsistingWorkforce,
            unemployedWorkforce,
            governmentWorkforce,
            laborerWorkforce,
            wage,
            totalWealth
        );
    }

    public static fromJson(json: any): PopulationStatBlock {
        return new PopulationStatBlock(
            json.lowerStrataPopulation,
            json.middleStrataPopulation,
            json.upperStrataPopulation,
            json.radicals,
            json.loyalists,
            json.politicalParticipants,
            json.salariedWorkforce,
            json.subsistingWorkforce,
            json.unemployedWorkforce,
            json.governmentWorkforce,
            json.laborerWorkforce,
            json.wage,
            json.totalWealth
        );
    }

    constructor(
        public readonly lowerStrataPopulation: number,
        public readonly middleStrataPopulation: number,
        public readonly upperStrataPopulation: number,
        public readonly radicals: number,
        public readonly loyalists: number,
        public readonly politicalParticipants: number,
        public readonly salariedWorkforce: number,
        public readonly subsistingWorkforce: number,
        public readonly unemployedWorkforce: number,
        public readonly governmentWorkforce: number,
        public readonly laborerWorkforce: number,
        public readonly wage: number,
        public readonly totalWealth: number
    ) {}

    toJson() {
        return {
            "lowerStrataPopulation": this.lowerStrataPopulation,
            "middleStrataPopulation": this.middleStrataPopulation,
            "upperStrataPopulation": this.upperStrataPopulation,
            "radicals": this.radicals,
            "loyalists": this.loyalists,
            "politicalParticipants": this.politicalParticipants,
            "salariedWorkforce": this.salariedWorkforce,
            "subsistingWorkforce": this.subsistingWorkforce,
            "unemployedWorkforce": this.unemployedWorkforce,
            "governmentWorkforce": this.governmentWorkforce,
            "laborerWorkforce": this.laborerWorkforce,
            "wage": this.wage,
            "totalWealth": this.totalWealth
        };
    }

    public getTotalPopulation(): number {
        return this.lowerStrataPopulation + this.middleStrataPopulation + this.upperStrataPopulation;
    }
}