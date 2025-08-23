import { Injectable } from '@angular/core';

export interface DiscordUser {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
}

@Injectable({
    providedIn: 'root'
})
export class DiscordAuthService {
    private clientId = '1403891748371038462';
    private redirectUri: string | null = null;
    private backendAuthUrl = 'http://localhost:3000/api/discord-auth';

    setRedirectUri(uri: string) {
        this.redirectUri = uri;
    }

    login() {
        if (!this.redirectUri) {
            throw new Error('Redirect URI is not set');
        }
        const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${this.clientId}&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_type=code&scope=identify`;
        window.location.href = discordAuthUrl;
    }

    async getUser(): Promise<DiscordUser | null> {
        if (!this.redirectUri) {
            throw new Error('Redirect URI is not set');
        }
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (!code) return null;
        try {
            const resp = await fetch(this.backendAuthUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, redirectUri: this.redirectUri })
            });
            if (!resp.ok) return null;
            const data = await resp.json();
            return data.user as DiscordUser;
        } catch {
            return null;
        }
    }
}
