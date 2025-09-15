import { HasAggregation } from "./HasAggregation";

export interface HasElements<E> {
    getElements(): HasAggregation<E>;
}