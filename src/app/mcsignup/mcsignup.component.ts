import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PolygonSelectComponent } from '../polygon-select/polygon-select.component';
import { RendererConfigProvider } from '../polygon-select/RendererConfigProvider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MapService } from '../map.service';
import * as THREE from 'three'
import { ThreeService } from './ThreeService';
import { DiscordLoginComponent } from '../discord-login/discord-login.component';

export interface TableItem {
    value: string;
}

@Component({
    selector: 'app-mcsignup',
    imports: [PolygonSelectComponent, DiscordLoginComponent, MatButtonModule, MatIconModule, MatTableModule, DragDropModule],
    templateUrl: './mcsignup.component.html',
    styleUrl: './mcsignup.component.scss'
})
export class MCSignupComponent {
    @ViewChild(PolygonSelectComponent) polygonSelectComponent!: PolygonSelectComponent;

    displayedColumns: string[] = ['index', 'value'];
    dataSource: TableItem[] = [];

    // Create a RendererConfigProvider instance
    configProvider: RendererConfigProvider;

    constructor(private mapService: MapService) {
        const colorMap = new Map<string, number>();
        this.configProvider = new RendererConfigProvider(colorMap);
    }

    ngOnInit() {
        const fileNames = ["Lombardy", "Sicily", "Iberia", "Maghreb", "WestAfrica", "Egypt"];
        const regionLists = new Map<string, any[]>();
        fileNames.forEach(async (name) => {
            const response = await fetch(`http://127.0.0.1:5500/public/regions/${name}.json`);
            if (response.ok) {
                const json = await response.json();
                regionLists.set(name, json ?? []);
                console.log(regionLists);
            }
        });
        this.mapService.fetchCK3GeoJson(true, false).subscribe((geojson: any) => {
            const THICKNESS = 2;
            const mapScale = 400.0;
            const meshes: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[] = [];
            ThreeService.addGeoJsonPolygons(geojson, mapScale, this.configProvider, THICKNESS, (mesh: any) => {
                meshes.push(mesh);
            });
            this.polygonSelectComponent.setMeshes(meshes);
            setTimeout(() => this.polygonSelectComponent.fitCameraToPolygons(0.1), 0);
            const totalTriangles = meshes.reduce((total, polygon) => {
                const geometry = polygon.geometry;
                if (geometry.index) {
                    return total + (geometry.index.count / 3);
                } else {
                    const positions = geometry.attributes['position'] as THREE.BufferAttribute;
                    return total + (positions.count / 3);
                }
            }, 0);
            console.log(`Loaded ${meshes.length} polygon meshes with ${Math.floor(totalTriangles).toLocaleString()} triangles total`);
        });
    }

    drop(event: CdkDragDrop<TableItem[]>) {
        moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
        this.dataSource = [...this.dataSource];
    }
}