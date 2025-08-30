import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom, timeout } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class BaseHttpService {

    private readonly timeoutMs: number = 10000;

    constructor(private http: HttpClient) { }

    async makeRequest<T = any>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, headers?: Record<string, string>): Promise<T> {
        const httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            ...headers
        });
        let request$: Observable<T>;
        switch (method) {
            case 'GET':
                request$ = this.http.get<T>(url, { headers: httpHeaders });
                break;
            case 'POST':
                request$ = this.http.post<T>(url, body, { headers: httpHeaders });
                break;
            case 'PUT':
                request$ = this.http.put<T>(url, body, { headers: httpHeaders });
                break;
            case 'DELETE':
                request$ = this.http.delete<T>(url, { headers: httpHeaders });
                break;
        }
        return await firstValueFrom(request$.pipe(timeout(this.timeoutMs)));
    }

    async makeAuthenticatedRequest<T = any>(url: string, token: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any, additionalHeaders?: Record<string, string>): Promise<T> {
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...additionalHeaders
        };

        return this.makeRequest<T>(url, method, body, headers);
    }
}
