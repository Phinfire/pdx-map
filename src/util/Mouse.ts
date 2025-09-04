export class Mouse {

    private isMiddleMouseDown = false;
    private isLeftMouseDown = false;
    private lastMousePos = { x: 0, y: 0 };

    constructor() {

    }

    onMove() {

    }

    isMiddleDown() {
        return this.isMiddleMouseDown;
    }

    onMouseDown(event: MouseEvent) {
        if (event.button === 1) {
            this.isMiddleMouseDown = true;
            this.lastMousePos = { x: event.clientX, y: event.clientY };
            event.preventDefault();
        }
        if (event.button === 0) {
            this.isLeftMouseDown = true;
        }
    }

    onMouseMove(event: MouseEvent) {
        if (this.isMiddleMouseDown && this.lastMousePos) {
            this.lastMousePos = { x: event.clientX, y: event.clientY };
        }
    }

    getDelta(event: MouseEvent) {
        if (this.lastMousePos) {
            const dx = event.clientX - this.lastMousePos.x;
            const dy = event.clientY - this.lastMousePos.y;
            return { dx, dy };
        }
        return { dx: 0, dy: 0 };
    }
}