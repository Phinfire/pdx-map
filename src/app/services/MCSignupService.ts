import { Injectable } from "@angular/core";
import { DiscordAuthenticationService } from "./discord-auth.service";
import { BaseHttpService } from "./base-http.service";

@Injectable({
    providedIn: "root"
})
export class MCSignupService {

    private registrationUrl = DiscordAuthenticationService.API_URL + '/signup';
    private getRegistrationUrl = DiscordAuthenticationService.API_URL + "/getsignup";
    private getAggregatedRegistrationsUrl = DiscordAuthenticationService.API_URL + "/signups";

    constructor(private discordAuthService: DiscordAuthenticationService, private httpService: BaseHttpService) {

    }

    private async makeAuthenticatedRequest(url: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: any): Promise<any> {
        if (!this.discordAuthService.isLoggedIn()) {
            throw new Error("Unable to make request. User not logged in");
        }

        const token = this.discordAuthService.getToken();
        return await this.httpService.makeAuthenticatedRequest(url, token!, method, body);
    }

    async register(picks: string[]) {
        return await this.makeAuthenticatedRequest(this.registrationUrl, 'POST', { picks });
    }

    async getRegistration() {
        return await this.makeAuthenticatedRequest(this.getRegistrationUrl, 'GET');
    }

    async getAggregatedRegistrations() {
        return await this.httpService.makeRequest(this.getAggregatedRegistrationsUrl, 'GET');
    }
}
