import { TableColumn } from "./TableColumn";
import { HasElements } from "./HasElements";
import { ImageIconType } from "./ImageIconType";

export class AggregatingTableColumn<C extends HasElements<E>, E> extends TableColumn<C> {

    constructor(
        def: string, 
        header: string, 
        tooltip: string, 
        sortable: boolean, 
        predicate: (element: E) => boolean, 
        valueExtractor: (element: E) => number,
        nameGetter: (element: E) => string,
        predicateForNormalization: ((element: E) => boolean) | null = null,
        headerImage: string | undefined = undefined,
        headerImageType: ImageIconType | undefined = undefined
    ) {
        const cellValue = (container: C, _: number) => {
            if (predicateForNormalization != null) {
                return container.getElements().getTotal(header, (e: E) => predicateForNormalization(e) && predicate(e), valueExtractor) / 
                       container.getElements().getTotal(header + "_norm", predicateForNormalization, valueExtractor);
            }
            return container.getElements().getTotal(header, predicate, valueExtractor);
        }
        
        const cellTooltip = (container: C, _: number) => {
            const totalExplained = container.getElements().getTotalExplanation(
                header, 
                (e: E) => predicate(e) && (predicateForNormalization == null || predicateForNormalization(e)), 
                valueExtractor, 
                nameGetter
            ) as Map<string, number>;
            const maxValStringLength = Math.max(...Array.from(totalExplained.values()).map(val => this.format(val).length));
            return Array.from(totalExplained.entries()).sort((a, b) => b[1] - a[1])
                .map(([name, val]) => `${this.format(val).padStart(maxValStringLength, ' ')}  ${name}`)
                .join('\n');
        }
        
        super(def, header, tooltip, sortable, cellValue, cellTooltip, null, false, headerImage, headerImageType);
    }
}