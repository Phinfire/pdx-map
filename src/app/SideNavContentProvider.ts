import { Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})
export class SideNavContentProvider {

    private handleCounter = 0;
    private actions: Map<string, () => void> = new Map();
    private toolbarActions: Map<string,{ icon: string, tooltip: string, action: () => void }> = new Map();
    private toolbarLabel: string | null = null;

    constructor() {
    }
    
    getActions(): { label: string, action: () => void }[] {
        return Array.from(this.actions.entries()).map(([label, action]) => ({ label, action }));
    }

    getToolbarActions() {
        return this.toolbarActions;
    }

    addToolbarAction(icon: string, tooltip: string, action: () => void) {
        const handle = `action-${this.handleCounter++}`;
        this.toolbarActions.set(handle, { icon, tooltip, action });
        return handle;
    }

    removeToolbarAction(handle: string) {
        this.toolbarActions.delete(handle);
    }

    clearToolbarActions() {
        this.toolbarActions.clear();
    }

    getToolbarLabel(): string | null {
        return this.toolbarLabel;
    }

    setToolbarLabel(text: string) {
        this.toolbarLabel = text;
    }

    clearToolbarLabel() {
        this.toolbarLabel = null;
    }
}