export class BehaviorConfigProvider {

    constructor(private lockedHeight: number) {

    }

    getLockedHeight() {
        return this.lockedHeight;
    }

    getLiftHeight() {
        return 0.75 * this.lockedHeight;
    }

    getLockedHoverHeight() {
        return 0.75 * this.lockedHeight;
    }

    getLiftSpeed() {
        return 0.5;
    }

    getTargetZ(locked: boolean, hover: boolean) {
        if (hover) {
            if (!locked) {
                return this.getLiftHeight();
            } else {
                return this.getLockedHoverHeight();
            }
        } else {
            if (!locked) {
                return 0;
            } else {
                return this.getLockedHeight();
            }
        }
    }
}