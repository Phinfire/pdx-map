import { RGB } from "../../../util/RGB";
import { Character } from "../Character";
import { CK3 } from "../CK3";
import { RulerTier } from "../RulerTier";
import { ICk3Save } from "../save/ICk3Save";

export abstract class AbstractLandedTitle {

    private holderIndex: number | null = null;
    private deFactoLiegeIndex: number | null;

    protected constructor(private key: string, holder: string, deFactoLiege: string | null, protected save: ICk3Save, protected ck3: CK3) {
        if (holder) {
            this.holderIndex = parseInt(holder);
        }
        this.deFactoLiegeIndex = deFactoLiege ? parseInt(deFactoLiege) : null;
    }

    public abstract getColor(): RGB;

    public abstract getLocalisedName(): String;

    public abstract getTier(): RulerTier;

    public getKey() {
        return this.key;
    }

    public getHolder() {
        if (this.holderIndex === null) {
            return null;
        }
        return this.save.getCharacter(this.holderIndex)!;
    }

    public getDeFactoLiegeTitle() {
        if (this.deFactoLiegeIndex) {
            return this.save.getTitleByIndex(this.deFactoLiegeIndex);
        }
        return null;
    }

    public getUltimateLiegeTitle() {
        let current: AbstractLandedTitle = this;
        while (current.getDeFactoLiegeTitle() != null) {
            const next = current.getDeFactoLiegeTitle()!;
            if (next == null || next.getKey() == current.getKey()) {
                return current;
            }
            current = next;
        }
        return current;
    }
    
    public getUltimatePlayerHeldLiegeTitle(): AbstractLandedTitle | null {
        if (this.getHolder() === null) {
            return null;
        }
        const playerName = this.getHolder()!.getPlayerName();
        if (playerName != null) {
            return this;
        }
        const liegeTitle = this.getDeFactoLiegeTitle();
        return liegeTitle ? liegeTitle.getUltimatePlayerHeldLiegeTitle() : null;
    }
}