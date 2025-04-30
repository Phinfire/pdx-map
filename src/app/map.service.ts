import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Eu4Save } from './model/Eu4Save';

@Injectable({
    providedIn: 'root'
})
export class MapService {
    private readonly geoJsonUrl = 'https://codingafterdark.de/pdx/provinces_contours.geojson';

    private activeSave: Eu4Save | null = null;

    constructor(private http: HttpClient) {
        this.http.get('http://127.0.0.1:5500/public/test.json').subscribe((data) => {
            this.activeSave = new Eu4Save(data);
        });
    }

    fetchGeoJson(): Observable<any> {
        return this.http.get(this.geoJsonUrl);
    }
}