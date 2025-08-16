import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ThreeService } from '../mcsignup/ThreeService';
import * as THREE from 'three';
import { MapService } from '../map.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-polygon-select',
    imports: [MatIconModule],
    templateUrl: './polygon-select.component.html',
    styleUrl: './polygon-select.component.scss'
})
export class PolygonSelectComponent {

    @Input() selectedIds: string[] = [];

    private readonly CLEAR_COLOR = 0x000000;
    private readonly INACTIVE_GEOMETRY_COLOR = 0x202020;
    private readonly GEOMETRY_DEFAULT_COLOR = 0x666666;
    private readonly GEOMETRY_HOVER_COLOR = 0xc0c0c0;
    private readonly GEOMETRY_LOCKED_COLOR = 0xffd700;
    private readonly LIGHT_INTENSITY = 2;
    private raycaster = new THREE.Raycaster();
    private mouse = new THREE.Vector2();
    private isMiddleMouseDown = false;
    private isLeftMouseDown = false;
    private lastMousePos: { x: number, y: number } | null = null;
    private hoveredPolygon: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key?: string }) | null = null;
    private needsRaycast = false;
    @ViewChild('rendererContainer', { static: true }) containerRef!: ElementRef;

    private scene!: THREE.Scene;
    private camera!: THREE.PerspectiveCamera;
    private renderer!: THREE.WebGLRenderer;
    private animationId!: number;
    private polygons: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[] = [];

    constructor(private mapService: MapService) { }

    public cameraHeight = 400;
    public mapScale = 400.0;
    private readonly THICKNESS = 2;
    private readonly LOCKED_HEIGHT = 2;
    private readonly LIFT_HEIGHT = 0.75 * this.LOCKED_HEIGHT;
    private readonly LIFT_SPEED = 0.5;

    private fitCameraToPolygons(margin: number) {
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
            return; // User cancelled
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

    ngOnInit(): void {
        this.initScene();
        this.mapService.fetchCK3GeoJson(true, false).subscribe((geojson: any) => {
            ThreeService.addGeoJsonPolygons(geojson, this.mapScale, this.GEOMETRY_DEFAULT_COLOR, this.INACTIVE_GEOMETRY_COLOR, this.THICKNESS, (mesh: any) => {
                this.scene.add(mesh);
                this.polygons.push(mesh);
            });
            setTimeout(() => this.fitCameraToPolygons(0), 0);
            const totalTriangles = this.polygons.reduce((total, polygon) => {
                const geometry = polygon.geometry;
                if (geometry.index) {
                    return total + (geometry.index.count / 3);
                } else {
                    const positions = geometry.attributes['position'] as THREE.BufferAttribute;
                    return total + (positions.count / 3);
                }
            }, 0);
            console.log(`Loaded ${this.polygons.length} polygon meshes with ${Math.floor(totalTriangles).toLocaleString()} triangles total`);
        });
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
        this.renderer.setClearColor(this.CLEAR_COLOR);
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
            const speed = 0.05 * (this.camera.position.z / this.cameraHeight);
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
                    const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean };
                    if (!polygon.locked && polygon.interactive) {
                        polygon.locked = true;
                        (polygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_LOCKED_COLOR);
                        polygon.targetZ = this.LOCKED_HEIGHT;
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
            this.camera.position.z += event.deltaY * 0.20;
            this.camera.position.z = Math.max(10, Math.min(1000, this.camera.position.z));
            event.preventDefault();
        }
    };

    private onClick = (event: MouseEvent) => {
        const container = this.containerRef.nativeElement;
        if (container.contains(event.target as Node)) {
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = this.raycaster.intersectObjects(this.polygons);
            if (intersects.length > 0) {
                const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean };
                if (polygon.interactive) {
                    polygon.locked = !polygon.locked;
                    if (polygon.locked) {
                        (polygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_LOCKED_COLOR);
                        polygon.targetZ = this.LOCKED_HEIGHT;
                    } else {
                        (polygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
                        polygon.targetZ = 0;
                        if (this.hoveredPolygon === polygon) {
                            this.hoveredPolygon = null;
                        }
                    }
                }
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
                const polygon = intersects[0].object as THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean };
                if (!polygon.locked && polygon.interactive) {
                    if (this.hoveredPolygon !== polygon) {
                        if (this.hoveredPolygon && !this.hoveredPolygon.locked) {
                            (this.hoveredPolygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
                            this.hoveredPolygon.targetZ = 0;
                        }
                        this.hoveredPolygon = polygon;
                        (polygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_HOVER_COLOR);
                        polygon.targetZ = this.LIFT_HEIGHT;
                    }
                } else {
                    if (this.hoveredPolygon && !this.hoveredPolygon.locked) {
                        (this.hoveredPolygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
                        this.hoveredPolygon.targetZ = 0;
                        this.hoveredPolygon = null;
                    }
                }
            } else if (this.hoveredPolygon && !this.hoveredPolygon.locked) {
                (this.hoveredPolygon.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
                this.hoveredPolygon.targetZ = 0;
                this.hoveredPolygon = null;
            }
        }
        this.polygons.forEach(poly => {
            if (poly.targetZ !== undefined) {
                poly.position.z += (poly.targetZ - poly.position.z) * this.LIFT_SPEED;
            }
        });

        this.renderer.render(this.scene, this.camera);
    };

    homeButtonClicked() {
        this.fitCameraToPolygons(0);
    }

    refreshButtonClicked() {
        this.polygons.forEach(poly => {
            poly.locked = false;
            poly.targetZ = 0;
            if ((poly.material as THREE.MeshPhongMaterial).color.getHex() === this.GEOMETRY_LOCKED_COLOR) {
                (poly.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
            }
        });
    }

    private setLockedState(keys: string[], locked: boolean) {
        this.polygons.forEach(poly => {
            if (keys.includes(poly.key)) {
                poly.locked = locked;
                if (locked) {
                    (poly.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_LOCKED_COLOR);
                    poly.targetZ = this.LOCKED_HEIGHT;
                } else {
                    (poly.material as THREE.MeshPhongMaterial).color.set(this.GEOMETRY_DEFAULT_COLOR);
                    poly.targetZ = 0;
                    if (this.hoveredPolygon === poly) {
                        this.hoveredPolygon = null;
                    }
                }
            }
        });
    }
}
