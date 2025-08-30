import { Injectable } from '@angular/core';
import { DiscordUser } from '../util/DiscordUser';
import { BaseHttpService } from './base-http.service';

export interface ApiHealth {
    timestamp: string;
    uptime: number;
    dbIsUp: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DiscordAuthenticationService {

    public static readonly API_URL = "http://localhost:3000/api";
    private readonly JWT_STORAGE_KEY = "discordToken";
    private clientId = "1403891748371038462";
    private backendAuthUrl = DiscordAuthenticationService.API_URL + "/auth";
    private backendGetUserUrl = DiscordAuthenticationService.API_URL + "/user";
    private jwt: string | null;
    private loggedInUser: DiscordUser | null = null;

    constructor(private httpService: BaseHttpService) {
        this.jwt = localStorage.getItem(this.JWT_STORAGE_KEY);
        if (this.jwt) {
            (async () => {
                this.loggedInUser = await this.getUserViaJWT(this.getRedirectUrl());
            })();
        } else {
            (async () => {
                this.loggedInUser = await this.exchangeCodeForJWT(this.getRedirectUrl());
            })();
        }
    }

    private async makeAuthenticatedRequest<T = any>(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<T> {
        if (!this.jwt) {
            throw new Error("JWT is null");
        }
        return await this.httpService.makeAuthenticatedRequest<T>(url, this.jwt, method, body);
    }

    getToken(): string | null {
        return this.jwt;
    }

    isLoggedIn(): boolean {
        return this.loggedInUser !== null;
    }

    getLoggedInUser(): DiscordUser | null {
        return this.loggedInUser;
    }

    getRedirectUrl(): string {
        const address = window.location.href;
        if (address.indexOf("?") != -1) {
            return address.split("?")[0];
        }
        window.history.replaceState({}, document.title, address.split("?")[0]);
        return address;
    }

    logOut() {
        this.jwt = null;
        this.loggedInUser = null;
        localStorage.removeItem(this.JWT_STORAGE_KEY);
    }

    async loginOnDiscord(redirectUri: string) {
        if (this.jwt == null) {
            console.log("Not logged in, redirecting to Discord OAuth2");
            const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify`;
            window.location.href = discordAuthUrl;
        } else {
            console.log("Already logged in, fetching user info");
            this.loggedInUser = await this.getUserViaJWT(redirectUri);
        }
    }

    async exchangeCodeForJWT(redirectUri: string): Promise<DiscordUser | null> {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            const url = new URL(window.location.href);
            url.searchParams.delete('code');
            window.history.replaceState({}, document.title, url.toString());
        }
        if (!code) return null;
        
        try {
            const data = await this.httpService.makeRequest(this.backendAuthUrl, 'POST', { code, redirectUri: redirectUri });
            localStorage.setItem(this.JWT_STORAGE_KEY, data.token);
            this.jwt = data.token;
            const user = DiscordUser.fromApiJson(data.user);
            return user;
        } catch {
            return null;
        }
    }

    private async getUserViaJWT(redirectUri: string): Promise<DiscordUser | null> {
        if (this.loggedInUser) {
            return this.loggedInUser;
        }
        try {
            const data = await this.makeAuthenticatedRequest(this.backendGetUserUrl, 'GET');
            
            // Note: HttpClient throws on HTTP error status codes, so we need different error handling
            const user = DiscordUser.fromApiJson(data.user);
            return user;
        } catch (error: any) {
            // Handle 401 specifically
            if (error.status === 401) {
                this.jwt = null;
                localStorage.removeItem(this.JWT_STORAGE_KEY);
                return null;
            }
            this.logOut();
            return null;
        }
    }

    async isOnline(): Promise<boolean> {
        return this.getHealth() != null;
    }

    async getHealth() {
        try {
            const data = await this.httpService.makeRequest<any>(`${this.backendAuthUrl}/health`, 'GET');
            return {
                timestamp: data.timestamp,
                uptime: data.uptime,
                dbIsUp: data.db_up
            }
        } catch {
            return null;
        }
    }
}
