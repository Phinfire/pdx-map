import { Component } from '@angular/core';
import { DiscordAuthenticationService } from '../services/discord-auth.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'app-discord-field',
    templateUrl: './discord-field.component.html',
    styleUrls: ['./discord-field.component.scss'],
    imports: [CommonModule, MatButtonModule, MatIconModule]
})
export class DiscordFieldComponent {

    constructor(private discordAuthService: DiscordAuthenticationService) {

    }

    isLoggedIn() {
        return this.discordAuthService.getLoggedInUser() !== null;
    }

    getAvatarUrl() {
        if (this.isLoggedIn()) {
            const user = this.discordAuthService.getLoggedInUser()!;
            return user.getAvatarImageUrl();
        }
        return null;
    }

    getUserName() {
        if (this.isLoggedIn()) {
            const user = this.discordAuthService.getLoggedInUser()!;
            return user.global_name;
        }
        return '-';
    }

    logOut() {
        this.discordAuthService.logOut();
    }
}
