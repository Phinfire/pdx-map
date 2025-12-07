import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root',
})
export class MegaModderE2VService {

    getDevelopmentToPopTransformation(): (dev: number) => number {
        return dev => {
            if (dev < 1000) {
                return (15 / 1000) * dev;
            } else {
                return 15 * (1 + Math.log(dev / 1000));
            }
        }
    }

    //
}