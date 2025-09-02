import { RendererConfigProvider } from "./RendererConfigProvider";
import * as d3 from 'd3';

export class DynamicColorConfig extends RendererConfigProvider {

    private key2Value: Map<string, number>;

    constructor(key2Value: Map<string, number>) {
        super(new Map<string, number>());
        this.key2Value = key2Value;
    }

    private valueToColor(value: number) {
        const max = Math.max(...Array.from(this.key2Value.values()));
        const normalizedValue = value / max;
        const scale = d3.scaleSequential(d3.interpolateInferno);
        scale.domain([0, 1]);
        const hex = scale(normalizedValue);
        return parseInt(hex.slice(1), 16);
    }

    override getColor(key: string): number {
        return this.valueToColor(this.key2Value.get(key) || 0);
    }
}