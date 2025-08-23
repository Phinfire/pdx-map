import { Component, ElementRef, Input, SimpleChanges, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { MatIconModule } from '@angular/material/icon';
import { RendererConfigProvider } from './RendererConfigProvider';

export class MapMesh {

}

@Component({
    selector: 'app-polygon-select',
    imports: [MatIconModule],
    templateUrl: './polygon-select.component.html',
    styleUrl: './polygon-select.component.scss'
})
export class PolygonSelectComponent {

    @Input() rendererConfigProvider: RendererConfigProvider | null = null;

    private readonly LIGHT_INTENSITY = 2;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private isMiddleMouseDown = false;
    private isLeftMouseDown = false;
    private lastMousePos: { x: number, y: number } | null = null;
    private lastHoveredMesh: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string }) | null = null;
    private needsRaycast = false;
    @ViewChild('rendererContainer', { static: true }) containerRef!: ElementRef;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private animationId!: number;
    private polygons: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[] = [];

    public cameraHeight = 400;
    public zoomToCursor = true;
    private readonly LOCKED_HEIGHT = 1;
    private readonly LIFT_HEIGHT = 0.75 * this.LOCKED_HEIGHT;
    private readonly LOCKED_HOVER_HEIGHT = 0.75 * this.LOCKED_HEIGHT;
    private readonly LIFT_SPEED = 0.5;

    constructor() {

    }

    public fitCameraToPolygons(margin: number) {
        if (!this.polygons.length) return;
        const box = new THREE.Box3();
        this.polygons.forEach(poly => box.expandByObject(poly));
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const container = this.containerRef.nativeElement;
        const aspect = container.clientWidth / container.clientHeight;
        const fov = this.camera.fov * (Math.PI / 180);
        const width = size.x * (1 + margin);
        const height = size.y * (1 + margin);
        const depth = size.z * (1 + margin);
        const rotatedHeight = Math.sqrt(height * height + depth * depth);
        const distanceForHeight = rotatedHeight / (2 * Math.tan(fov / 2));
        const distanceForWidth = width / (2 * Math.tan(fov / 2) * aspect);
        const distance = Math.max(distanceForHeight, distanceForWidth) * 1.1;
        this.camera.position.set(center.x, center.y - distance * 0.1, distance + center.z);
        this.camera.lookAt(center.x, center.y, center.z);
        this.camera.updateProjectionMatrix();
    }

    storeCurrentLockSelectionToFile() {
        const lockedPolygons = this.polygons.filter(poly => poly.locked);
        if (lockedPolygons.length === 0) {
            alert('No polygons are currently locked to save.');
            return;
        }

        const filename = prompt('Enter a filename for the selection:', 'locked_polygons');
        if (filename === null) {
            return;
        }

        const finalFilename = filename.trim() || 'locked_polygons';
        const data = JSON.stringify(lockedPolygons.map(poly => poly.key));
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${finalFilename}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    loadSelectionFromFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,application/json';
        input.onchange = (e: any) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event: ProgressEvent<FileReader>) => {
                try {
                    const keys = JSON.parse(event.target?.result as string);
                    this.setLockedState(keys, true);
                } catch (err) {
                    console.error('Failed to parse JSON:', err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rendererConfigProvider']) {
            for (const poly of this.polygons) {
                this.refreshPolyColor(poly);
            }
        }
    }

    public setMeshes(meshes: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[]) {
        this.scene.add(...meshes);
        this.polygons.push(...meshes);
    }

    ngOnInit(): void {
        this.initScene();
        window.addEventListener('mousemove', this.onMouseMove);
        window.addEventListener('mousedown', this.onMouseDown);
        window.addEventListener('mouseup', this.onMouseUp);
        window.addEventListener('wheel', this.onWheel, { passive: false });
        window.addEventListener('click', this.onClick);
        this.animate();
    }

    ngOnDestroy(): void {
        window.removeEventListener('mousemove', this.onMouseMove);
        window.removeEventListener('mousedown', this.onMouseDown);
        window.removeEventListener('mouseup', this.onMouseUp);
        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('click', this.onClick);
        cancelAnimationFrame(this.animationId);
        this.renderer.dispose();
    }

    private initScene() {
        const container = this.containerRef.nativeElement;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, container.clientWidth / container.clientHeight, 0.1, 1500);
        this.camera.position.set(0, -5, this.cameraHeight);
        this.camera.lookAt(0, 0, 0);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(this.rendererConfigProvider!.getClearColor());
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(this.renderer.domElement);
        const light = new THREE.DirectionalLight(0xffffff, this.LIGHT_INTENSITY);
        light.position.set(50, 50, 100);
        this.scene.add(light);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        this.scene.rotation.x = -0.5;
    }

    private onMouseMove = (event: MouseEvent) => {
        const container = this.containerRef.nativeElement;
        if (this.isMiddleMouseDown && this.lastMousePos) {
            const dx = event.clientX - this.lastMousePos.x;
            const dy = event.clientY - this.lastMousePos.y;
            const speed = 0.2 * (this.camera.position.z / this.cameraHeight);
            this.camera.position.x -= dx * speed;
            this.camera.position.y += dy * speed;
            this.lastMousePos = { x: event.clientX, y: event.clientY };
        }
        if (container.contains(event.target as Node)) {
            const rect = container.getBoundingClientRect();
            const newMouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
            const newMouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
            if (Math.abs(this.mouse.x - newMouseX) > 0.001 || Math.abs(this.mouse.y - newMouseY) > 0.001) {
                this.mouse.x = newMouseX;
                this.mouse.y = newMouseY;
                this.needsRaycast = true;
            }

            if (this.isLeftMouseDown) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.polygons);
                if (intersects.length > 0) {
                    const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string };
                    if (!polygon.locked && polygon.interactive) {
                        polygon.locked = true;
                        polygon.targetZ = this.LOCKED_HEIGHT;
                        this.refreshPolyColor(polygon);
                    }
                }
            }
        }
    };

    private onMouseDown = (event: MouseEvent) => {
        if (event.button === 1) {
            this.isMiddleMouseDown = true;
            this.lastMousePos = { x: event.clientX, y: event.clientY };
            event.preventDefault();
        }
        if (event.button === 0) {
            this.isLeftMouseDown = true;
        }
    };

    private onMouseUp = (event: MouseEvent) => {
        if (event.button === 1) {
            this.isMiddleMouseDown = false;
            this.lastMousePos = null;
            event.preventDefault();
        }
        if (event.button === 0) {
            this.isLeftMouseDown = false;
        }
    };

    private onWheel = (event: WheelEvent) => {
        const container = this.containerRef.nativeElement;
        if (container.contains(event.target as Node)) {
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
            const oldZ = this.camera.position.z;
            const newZ = Math.max(10, Math.min(1000, oldZ * zoomFactor));

            if (this.zoomToCursor) {
                const rect = container.getBoundingClientRect();
                const mouseX = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
                const mouseY = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
                const fov = this.camera.fov * (Math.PI / 180);
                const aspect = container.clientWidth / container.clientHeight;
                const height = 2 * Math.tan(fov / 2) * oldZ;
                const width = height * aspect;
                const worldMouseX = mouseX * width / 2;
                const worldMouseY = mouseY * height / 2;
                const zoomRatio = (oldZ - newZ) / oldZ;
                this.camera.position.x += worldMouseX * zoomRatio;
                this.camera.position.y += worldMouseY * zoomRatio;
            }

            this.camera.position.z = newZ;
            event.preventDefault();
        }
    };

    private onClick = (event: MouseEvent) => {
        const container = this.containerRef.nativeElement;
        if (!container.contains(event.target as Node)) {
            return;
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.polygons);
        if (intersects.length > 0) {
            const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string };
            if (polygon.interactive) {
                polygon.locked = !polygon.locked;
                if (polygon.locked) {
                    polygon.targetZ = this.lastHoveredMesh === polygon ? this.LOCKED_HOVER_HEIGHT : this.LOCKED_HEIGHT;
                } else {
                    polygon.targetZ = this.lastHoveredMesh === polygon ? this.LIFT_HEIGHT : 0;
                }
                this.refreshPolyColor(polygon);
                this.needsRaycast = true;
            }
        }
    };

    private animate = () => {
        this.animationId = requestAnimationFrame(this.animate);
        if (this.needsRaycast) {
            this.needsRaycast = false;
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.polygons);
            if (intersects.length > 0) {
                const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string };
                if (polygon.interactive) {
                    if (!polygon.locked) {
                        if (this.lastHoveredMesh !== polygon) {
                            if (this.lastHoveredMesh && !this.lastHoveredMesh.locked) {
                                this.lastHoveredMesh.targetZ = 0;
                            } else if (this.lastHoveredMesh && this.lastHoveredMesh.locked) {
                                this.lastHoveredMesh.targetZ = this.LOCKED_HEIGHT;
                            }
                            polygon.targetZ = this.LIFT_HEIGHT;
                        }
                    } else {
                        if (this.lastHoveredMesh !== polygon) {
                            if (this.lastHoveredMesh && !this.lastHoveredMesh.locked) {
                                this.lastHoveredMesh.targetZ = 0;
                            } else if (this.lastHoveredMesh && this.lastHoveredMesh.locked) {
                                this.lastHoveredMesh.targetZ = this.LOCKED_HEIGHT;
                            }
                            polygon.targetZ = this.LOCKED_HOVER_HEIGHT;
                        }
                    }
                } else {
                    if (this.lastHoveredMesh && !this.lastHoveredMesh.locked) {
                        this.lastHoveredMesh.targetZ = 0;
                    } else if (this.lastHoveredMesh && this.lastHoveredMesh.locked) {
                        this.lastHoveredMesh.targetZ = this.LOCKED_HEIGHT;
                    }
                }
                this.setHovered(polygon);
            } else if (this.lastHoveredMesh) {
                if (!this.lastHoveredMesh.locked) {
                    this.lastHoveredMesh.targetZ = 0;
                } else {
                    this.lastHoveredMesh.targetZ = this.LOCKED_HEIGHT;
                }
                this.setHovered(null);
            }
        }
        this.polygons.forEach(poly => {
            if (poly.targetZ !== undefined) {
                poly.position.z += (poly.targetZ - poly.position.z) * this.LIFT_SPEED;
            }
        });
        this.renderer.render(this.scene, this.camera);
    };

    refreshButtonClicked() {
        this.polygons.forEach(poly => {
            poly.locked = false;
            poly.targetZ = 0;
            this.refreshPolyColor(poly);
        });
    }

    setHovered(currentlyHovered: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string }) | null) {
        const localLastHoveredMesh = this.lastHoveredMesh;
        this.lastHoveredMesh = currentlyHovered;
        if (localLastHoveredMesh != null) {
            this.refreshPolyColor(localLastHoveredMesh);
        }
        if (currentlyHovered != null) {
            this.refreshPolyColor(currentlyHovered);
        }
    }

    refreshPolyColor(polygon: THREE.Mesh & { key: string, interactive?: boolean, locked?: boolean }) {
        if (this.rendererConfigProvider) {
            const interactive = polygon.interactive ?? false;
            const hover = this.lastHoveredMesh === polygon;
            const locked = polygon.locked ?? false;
            const color = this.rendererConfigProvider.getColor(polygon.key, interactive, hover, locked);
            (polygon.material as THREE.MeshPhongMaterial).color.set(color);
        }
    }

    private setLockedState(keys: string[], locked: boolean) {
        this.polygons.forEach(poly => {
            if (keys.includes(poly.key)) {
                poly.locked = locked;
                if (locked) {
                    // If this polygon is currently hovered, set it to locked hover height
                    if (this.lastHoveredMesh === poly) {
                        poly.targetZ = this.LOCKED_HOVER_HEIGHT;
                    } else {
                        poly.targetZ = this.LOCKED_HEIGHT;
                    }
                } else {
                    poly.targetZ = 0;
                    if (this.lastHoveredMesh === poly) {
                        this.lastHoveredMesh = null;
                    }
                }
                this.refreshPolyColor(poly);
            }
        });
    }
}
