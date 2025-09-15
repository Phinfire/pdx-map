import { Injectable } from "@angular/core";
import { ValueViewMode, ViewMode } from "./ViewMode";
import { County } from "../../model/ck3/County";
import { ICk3Save } from "../../model/ck3/save/ICk3Save";
import { Eu4Save } from '../../model/eu4/Eu4Save';
import { ColorConfigProvider } from '../viewers/polygon-select/ColorConfigProvider';
import { RGB } from '../../util/RGB';
import { ValueGradientColorConfig } from "../viewers/polygon-select/DynamicColorConfig";

@Injectable({
    providedIn: 'root'
})
export class ViewModeProvider {

    public buildViewModesForCk3(save: ICk3Save): ViewMode<any>[] {
        return [
            this.build(save, (entity: County) => entity.getDevelopment(), "Development", "bar_chart"),
            this.buildIncomeView(save),
        ];
    }

    private build(save: ICk3Save, entity2Value: (entity: County) => number, valueName: string, icon: string): ViewMode<any> {
        const key2Entity = new Map<string, County>();
        save.getCounties().forEach(county => {
            key2Entity.set(county.getKey(), county);
        });
        return new ValueViewMode<County>(key2Entity, entity2Value, (entity: County) => (save as ICk3Save).getTitle(entity.getKey())!.getLocalisedName(), valueName, icon);
    }

    private buildIncomeView(save: ICk3Save): ViewMode<any> {
        const key2Entity = new Map<string, County>();
        save.getCounties().forEach(county => {
            key2Entity.set(county.getKey(), county);
        });
        const entity2Value = (entity: County) => entity.getHoldings().reduce((sum, holding) => sum + holding[1].getIncome(), 0);
        const key2Value = new Map<string, number>();
        save.getCounties().forEach(county => {
            key2Value.set(county.getKey(), entity2Value(county));
        });
        const colorConfig = new ValueGradientColorConfig(key2Value);
        return new class implements ViewMode<any> {

            getColorConfig(): ColorConfigProvider {
                return colorConfig;
            }
            getTooltip(): (key: string) => string {
                return (key: string) => {
                    const entity = key2Entity.get(key)!;
                    const val = entity2Value(entity).toFixed(2);
                    const s = entity.getHoldings().map(holdingAndTitle => {
                        const baronyTitleKey = holdingAndTitle[0];
                        const holding = holdingAndTitle[1];
                        const holdingIncome = holding.getIncome().toFixed(2);
                        const baronyName = save.getTitle(baronyTitleKey)?.getLocalisedName() ?? baronyTitleKey;
                        return "<strong>" + holdingIncome + "</strong> " + baronyName;
                    }).reduce((prev, curr) => prev + `<br>${curr}`, '');
                    return `<strong>${save.getTitle(entity.getKey())!.getLocalisedName()}</strong><br><br><strong>${val}</strong><br><small><i>${s}</i></small>`;
                };
            }

        }
    }

    public buildViewModeForEu4(eu4Save: Eu4Save): ViewMode<any> {
        const key2province = new Map<string, any>();
        const key2color = new Map<string, number>();
        eu4Save.getProvinces().forEach(prov => {
            key2province.set(prov.getId(), prov);
            if (prov.getOwner() != null) {
                const color = prov.getOwner()!.getColor();
                key2color.set(prov.getId(), new RGB(color[0], color[1], color[2]).toNumber());
            }
        });
        return new class implements ViewMode<any> {
            getColorConfig(): ColorConfigProvider {
                return new ColorConfigProvider(key2color, false);
            }
            getTooltip(): (key: string) => string {
                return (key: string) => {
                    const province = key2province.get(key);
                    if (!province) return '';
                    const owner = province.getOwner();
                    let tooltip = `<strong>${province.getName()}</strong><br>`;
                    if (owner) {
                        tooltip += `Owner: ${owner.getTag()}`;
                    } else {
                        tooltip += `Unowned`;
                    }
                    return tooltip;
                };
            }
        };
    }
}