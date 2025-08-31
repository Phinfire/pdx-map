export class RendererConfigProvider {

    private readonly GEOMETRY_DEFAULT_COLOR = 0x666666;

    private readonly INACTIVE_GEOMETRY_COLOR = 0x202020;
    private readonly GEOMETRY_HOVER_COLOR = 0xc0c0c0;
    private readonly GEOMETRY_LOCKED_COLOR = 0xffd700;

    constructor(private key2color: Map<string, number>) {

    }

    getColor(key: string, interactive: boolean, hover: boolean, locked: boolean) {
        if (interactive) {
            const primaryColor = this.getPrimaryColor(key);
            if (locked) {
                if (hover) {
                    //return this.alphaBlend(primaryColor, this.GEOMETRY_HOVER_COLOR, 0.25);
                    return primaryColor;
                } else {
                    return primaryColor;
                }
            } else {
                if (hover) {
                    return this.adjustBrightness(primaryColor, 0.8);
                } else {
                    return this.adjustBrightness(primaryColor, 0.4);
                }
            }
        } else {
            return this.INACTIVE_GEOMETRY_COLOR;
        }
    }

    private getPrimaryColor(key: string) {
        if (this.key2color.has(key)) {
            return this.key2color.get(key)!;
        }
        return this.GEOMETRY_DEFAULT_COLOR;
    }

    getClearColor() {
        return 0x000000;
        //return 0x141419;
    }

    alphaBlend(color1: number, color2: number, alpha: number): number {
        alpha = Math.max(0, Math.min(1, alpha));

        const r1 = (color1 >> 16) & 0xff;
        const g1 = (color1 >> 8) & 0xff;
        const b1 = color1 & 0xff;

        const r2 = (color2 >> 16) & 0xff;
        const g2 = (color2 >> 8) & 0xff;
        const b2 = color2 & 0xff;
        const r = Math.round(r1 * (1 - alpha) + r2 * alpha);
        const g = Math.round(g1 * (1 - alpha) + g2 * alpha);
        const b = Math.round(b1 * (1 - alpha) + b2 * alpha);
        return (r << 16) | (g << 8) | b;
    }

    adjustBrightness(color: number, brightnessFactor: number): number {
        brightnessFactor = Math.max(0, Math.min(1, brightnessFactor));

        const r = (color >> 16) & 0xff;
        const g = (color >> 8) & 0xff;
        const b = color & 0xff;

        const newR = Math.round(r * brightnessFactor);
        const newG = Math.round(g * brightnessFactor);
        const newB = Math.round(b * brightnessFactor);

        const clampedR = Math.max(0, Math.min(255, newR));
        const clampedG = Math.max(0, Math.min(255, newG));
        const clampedB = Math.max(0, Math.min(255, newB));

        return (clampedR << 16) | (clampedG << 8) | clampedB;
    }
}