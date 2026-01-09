import { TableColumn } from "./TableColumn";
import { ImageIconType } from "./ImageIconType";

export class SimpleTableColumn<T> extends TableColumn<T> {

    constructor(
        def: string,
        header: string,
        cellValue: (element: T, index: number) => any,
        subscript: ((element: T) => string) | null = null,
        isImage: boolean = false,
        headerImage?: string,
        headerImageType?: ImageIconType
    ) {
        super(
            def,
            header,
            null,
            true,
            cellValue,
            (element: T, index: number) => null,
            subscript,
            isImage,
            headerImage,
            headerImageType
        );
    }
}