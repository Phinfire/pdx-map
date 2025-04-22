import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IHasKey {
  getKey(): string;
}

class HasKey implements IHasKey {
  private key: string;
  constructor(key: string) {
    this.key = key;
  }
  getKey(): string {
    return this.key;
  }
}

interface IValueMapMode {
  iconUrl: string;
  tooltip: string;
  valueGetter: (county: IHasKey) => number;
}

interface ICategoryMapMode {
  iconUrl: string;
  tooltip: string;
  valueGetter: (county: IHasKey) => string;
  colorGetter: (county: IHasKey) => string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private readonly geoJsonUrl = 'https://codingafterdark.de/pdx/provinces_contours.geojson';

  constructor(private http: HttpClient) {}

  fetchGeoJson(): Observable<any> {
    return this.http.get(this.geoJsonUrl);
  }

  getAvailableValueModes(): IValueMapMode[] {
    return [
      {
        iconUrl: 'https://codingafterdark.de/ck3/gfx/interface/icons/icon_gold.webp',
        tooltip: 'Total County Income',
        valueGetter: (arg: IHasKey) => 1
      }
    ];
  }

  getAvailableCategoryModes(): ICategoryMapMode[] {
    return [];
  }

  getName(element: IHasKey): string {
    return "Element "  + element.getKey();
  }

  getAllElements(): IHasKey[] {
    return [
      new HasKey('1'),
      new HasKey('2'),
      new HasKey('3'),
      new HasKey('4'),
      new HasKey('5')
    ];
  }
}