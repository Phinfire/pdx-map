import { RGB } from "../../../util/RGB";
import { CK3 } from "../CK3";
import { LegacyCk3Save } from "../LegacyCk3Save";
import { RulerTier } from "../RulerTier";
import { ICk3Save } from "../save/ICk3Save";
import { AbstractLandedTitle } from "./AbstractLandedTitle";

export class CustomLandedTitle extends AbstractLandedTitle {

    constructor(key: string, holder: string, deFactoLiege: string | null, private color: RGB, private tier: RulerTier, private vassalTitleIndices: number[], private name: string, save: ICk3Save, ck3: CK3) {
        super(key, holder, deFactoLiege, save, ck3);
        if (!this.name) {
            throw new Error("Custom landed title must have a name");
        }
    }

    public override getColor(): RGB {
        return this.color;
    }

    public override getLocalisedName(): String {
        return this.name;
    }

    public override getTier() {
        if (this.tier != RulerTier.NONE) {
            return this.tier;
        } else {
            return this.vassalTitleIndices.map((vassal: number) => this.save.getTitleByIndex(vassal).getTier()).reduce((prev: RulerTier, current: RulerTier) => prev.compare(current) > 0 ? prev : current, RulerTier.NONE).getNextHigherTier();
        }
    }
}