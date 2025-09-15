export interface HasAggregation<E> {
    getTotal(cacheKey: string, predicate: (element: E) => boolean, valueAccessor: (element: E) => number): number;
    getTotalExplanation<R>(cacheKey: string, predicate: (element: E) => boolean, valueAccessor: (element: E) => number, keyFunction: (element: E) => R): Map<R, number>;
}