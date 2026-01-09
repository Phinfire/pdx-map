import { ITableColumn } from "./ITableColumn";
import { ImageIconType } from "./ImageIconType";

export class TableColumn<T> implements ITableColumn<T> {

    public readonly headerImage?: string;
    public readonly headerImageType?: ImageIconType;

    public static getIndexColumn<T>(offset: number = 0): TableColumn<T> {
        return new TableColumn<T>(
            'position',
            '',
            null,
            false,
            (element: T, index: number) => index + 1 + offset,
            (element: T, index: number) => null,
            null,
            false,
            undefined,
            undefined
        );
    };

    public static wrapColumn<I,O>(column: TableColumn<I>, transform: (element: O) => I | null): TableColumn<O> {
        return new TableColumn<O>(
            column.def,
            column.header,
            column.tooltip,
            column.sortable,
            (element: O, index: number) => transform(element) != null ? column.cellValue(transform(element)!, index) : null,
            (element: O, index: number) => transform(element) != null  ? column.cellTooltip(transform(element)!, index) : null,
            column.subscript ? ((element: O) => {
                const transformed = transform(element);
                return transformed != null ? column.subscript!(transformed) : "";
            }) : null,
            column.isImage,
            column.headerImage,
            column.headerImageType
        );
    }

    public static from<T>(header: string, cellValue: (element: T, index: number) => any, cellTooltip: (element: T, index: number) => string, headerImage?: string, headerImageType?: ImageIconType) {
        return new TableColumn<T>(
            header.toLowerCase().replace(/\s+/g, '_'),
            header,
            null,
            true,
            cellValue,
            cellTooltip,
            null,
            headerImage != null,
            headerImage,
            headerImageType
        );
    }

    public readonly visibleCellValue: (element: T, index: number) => any;
    public readonly isImage: boolean;

    constructor(
        public readonly def: string,
        public readonly header: string,
        public tooltip: string | null,
        public readonly sortable: boolean,
        public readonly cellValue: (element: T, index: number) => any,
        public readonly cellTooltip: (element: T, index: number) => string | null,
        public readonly subscript: ((element: T) => string) | null = null,
        isImage: boolean = false,
        headerImage?: string,
        headerImageType?: ImageIconType
    ) {
        this.isImage = isImage;
        this.headerImage = headerImage;
        this.headerImageType = headerImageType;
        this.visibleCellValue = (element: T, index: number) => {
            const value = this.cellValue(element, index);
            if (this.isImage) {
                return value;
            }
            if (typeof value === 'number') {
                return this.format(value);
            }
            return value;
        }
    }

    protected format(value: number): string {
        return TableColumn.formatNumber(value);
    }

    public static formatNumber(value: number): string {
        if (value < 0) {
            return '-' + TableColumn.formatNumber(-value);
        }
        if (value === 0) {
            return '0';
        }
        if (value < 1) {
            return value.toFixed(2);
        }
        if (value < 1000) {
            return Math.floor(value) == value ? value.toString() : value.toFixed(1);
        } else if (value < 1000000) {
            return (value / 1000).toFixed(1) + 'K';
        } else {
            return (value / 1000000).toFixed(1) + 'M';
        }
    }
}