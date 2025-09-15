import { TableColumn } from "./TableColumn";

export class SimpleTableColumn<T> extends TableColumn<T> {

    constructor(
        def: string,
        header: string,
        cellValue: (element: T, index: number) => any,
        subscript: ((element: T) => string) | null = null,
        isImage: boolean = false,
        headerImage?: string
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
            headerImage
        );
    }
}