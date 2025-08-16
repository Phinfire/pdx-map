import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Eu4Save } from './model/eu4/Eu4Save';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class MapService {

    private readonly eu4GeoJsonUrl = 'https://codingafterdark.de/pdx/provinces_contours.geojson?' + new Date().getTime();

    private readonly ck3GeoJsonUrl = 'https://codingafterdark.de/ck3/counties.geojson?' + new Date().getTime();

    private activeSave: Eu4Save | null = null;

    constructor(private http: HttpClient) {
        /*
        this.http.get('http://127.0.0.1:5500/public/test.json').subscribe((data) => {
            this.activeSave = new Eu4Save(data);
        });*/
    }

    fetchEU4GeoJson(): Observable<any> {
        return this.http.get(this.eu4GeoJsonUrl);
    }

    fetchCK3GeoJson(removeWater: boolean, removeWastelands: boolean): Observable<any> {
        return this.http.get(this.ck3GeoJsonUrl).pipe(
            map((geojson: any) => {
                if (!geojson || !geojson.features) return geojson;
                geojson.features = geojson.features.filter((feature: any) => {
                    return (!removeWater || feature.properties?.type !== 'sea' && feature.properties?.type !== 'river') &&
                        (!removeWastelands || feature.properties?.type !== 'wasteland');
                });
                return geojson;
            })
        );
    }
}