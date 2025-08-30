import { Injectable, inject } from "@angular/core";
import { forkJoin, Observable, BehaviorSubject } from 'rxjs';
import { MapService } from '../map.service';
import { CK3Service } from '../services/gamedata/CK3Service';
import { tap, map } from 'rxjs/operators';
import { RendererConfigProvider } from '../polygon-select/RendererConfigProvider';
import { ThreeService } from './ThreeService';
import * as THREE from 'three';
import { AbstractLandedTitle } from "../model/ck3/title/AbstractLandedTitle";

export interface SignupAssetsData {
    geoJsonData: any;
    ck3SaveData: any;
    meshes: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[];
    configProvider: RendererConfigProvider;
}

@Injectable({
    providedIn: 'root'
})
export class SignupAssetsService {
    private mapService = inject(MapService);
    private ck3Service = inject(CK3Service);
    
    private _dataSubject = new BehaviorSubject<SignupAssetsData | null>(null);
    private _loadingSubject = new BehaviorSubject<boolean>(false);
    
    public data$ = this._dataSubject.asObservable();
    public loading$ = this._loadingSubject.asObservable();
    
    loadMapData(): Observable<SignupAssetsData> {
        this._loadingSubject.next(true);
        
        return forkJoin({
            geoJson: this.mapService.fetchCK3GeoJson(true, false),
            ck3Save: this.ck3Service.openCk3SaveFromFile("http://127.0.0.1:5500/public/ZERO_WILLIAM.ck3")
        }).pipe(
            tap(({ geoJson, ck3Save }) => {
                const key2color = new Map<string, number>();
                const key2ClusterKey = new Map<string, string>();
                const ck3 = ck3Save.getCK3();
                ck3Save.getLandedTitles().filter((title: AbstractLandedTitle) => title.getKey().startsWith("c_")).forEach((title: AbstractLandedTitle) => {
                    let liegeTitleKey = ck3.getDeJureLiegeTitle(title.getKey())!
                    liegeTitleKey = ck3.getDeJureLiegeTitle(liegeTitleKey)!;
                    liegeTitleKey = ck3.getDeJureLiegeTitle(liegeTitleKey)!;
                    const liegeTitle = ck3Save.getTitle(liegeTitleKey);
                    key2color.set(title.getKey(), liegeTitle.getColor().toNumber());
                });
                const configProvider = new RendererConfigProvider(key2color);
                const meshes = ThreeService.makeGeoJsonPolygons(geoJson, configProvider);
                const data: SignupAssetsData = {
                    geoJsonData: geoJson,
                    ck3SaveData: ck3Save,
                    meshes: meshes,
                    configProvider: configProvider
                };
                this._dataSubject.next(data);
                this._loadingSubject.next(false);
            }),
            map(({ geoJson, ck3Save }) => {
                const key2color = new Map<string, number>();
                ck3Save.getLandedTitles().filter((title: any) => title.getKey().startsWith("c_")).forEach((title: any) => {
                    key2color.set(title.getKey(), title.getColor().r << 16 | title.getColor().g << 8 | title.getColor().b);
                });
                const configProvider = new RendererConfigProvider(key2color);
                const meshes = ThreeService.makeGeoJsonPolygons(geoJson, configProvider);
                return {
                    geoJsonData: geoJson,
                    ck3SaveData: ck3Save,
                    meshes: meshes,
                    configProvider: configProvider
                };
            })
        );
    }
    
    isDataReady(): boolean {
        const data = this._dataSubject.value;
        return data !== null && data.geoJsonData && data.ck3SaveData && data.meshes && data.configProvider;
    }
    
    getCurrentData(): SignupAssetsData | null {
        return this._dataSubject.value;
    }
    
    isLoading(): boolean {
        return this._loadingSubject.value;
    }
    
    getMeshStatistics(meshes: (THREE.Mesh & { targetZ?: number, locked?: boolean, interactive?: boolean, key: string })[]): { meshCount: number, triangleCount: number } {
        const totalTriangles = meshes.reduce((total, polygon) => {
            const geometry = polygon.geometry;
            if (geometry.index) {
                return total + (geometry.index.count / 3);
            } else {
                const positions = geometry.attributes['position'] as THREE.BufferAttribute;
                return total + (positions.count / 3);
            }
        }, 0);
        
        return {
            meshCount: meshes.length,
            triangleCount: Math.floor(totalTriangles)
        };
    }
}