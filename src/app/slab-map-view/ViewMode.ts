import { RGB } from "../../util/RGB";
import { ColorConfigProvider } from "../viewers/polygon-select/ColorConfigProvider";
import { ValueGradientColorConfig } from "../viewers/polygon-select/DynamicColorConfig";

export interface ViewMode<T> {
    getColorConfig(): ColorConfigProvider;
    getTooltip(): (key: string) => string;
}

export class CategoryViewMode<T> implements ViewMode<T> {

    constructor(private key2Entity: Map<string, T>, private entity2Category: (entity: T) => string, private category2Color: (category: string) => RGB, private nameGetter: (entity: T) => string, private categoryType: string, private icon: string) {
        
    }

    getColorConfig(): ColorConfigProvider {
        throw new Error("Method not implemented.");
    }
    getTooltip(): (key: string) => string {
        throw new Error("Method not implemented.");
    }
    
}

export class ValueViewMode<T> implements ViewMode<T> {

    private colorConfig: ColorConfigProvider;

    constructor(private key2Entity: Map<string, T>, private entity2Value: (entity: T) => number, private nameGetter: (entity: T) => string, private valueName: string, private icon: string) {
        const key2Value = new Map<string, number>();
        for (const [key, entity] of key2Entity) {
            key2Value.set(key, entity2Value(entity));
        }
        this.colorConfig = new ValueGradientColorConfig(key2Value);
    }

    getIcon() {
        return this.icon;
    }

    getColorConfig(): ColorConfigProvider {
        return this.colorConfig;
    }

    getTooltip(): (key: string) => string {
        return (key: string) => {
            const entity = this.key2Entity.get(key);
            if (!entity) {
                return '';
            }
            const value = this.entity2Value(entity);
            let valueStr: string;
            if (typeof value === 'number') {
                valueStr = Number.isInteger(value) ? value.toString() : value.toFixed(2);
            } else {
                valueStr = value;
            }
            let tooltip = `<strong>${this.nameGetter(entity)}</strong><br>`;
            tooltip += `${valueStr} ${this.valueName}`;
            return tooltip;
        }
    }
}