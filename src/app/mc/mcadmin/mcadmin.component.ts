import { Component, inject, ViewChild } from '@angular/core';
import { DiscordFieldComponent } from '../../discord-field/discord-field.component';
import { DiscordLoginComponent } from '../../discord-login/discord-login.component';
import { MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TableComponent } from '../../vic3-country-table/vic3-country-table.component';
import { DiscordAuthenticationService } from '../../../services/discord-auth.service';
import { MCSignupService } from '../../../services/MCSignupService';
import { DiscordUser } from '../../../util/DiscordUser';
import { SimpleTableColumn } from '../../../util/table/SimpleTableColumn';
import { TableColumn } from '../../../util/table/TableColumn';

@Component({
    selector: 'app-mcadmin',
    imports: [DiscordLoginComponent, DiscordFieldComponent, MatTableModule, MatSortModule, TableComponent],
    templateUrl: './mcadmin.component.html',
    styleUrl: './mcadmin.component.scss'
})
export class MCAdminComponent {

    discordAuthService = inject(DiscordAuthenticationService);
    mcSignupService = inject(MCSignupService);

    protected tableData = new MatTableDataSource<DiscordUser>([]);

    protected loadedUsers: DiscordUser[] = [];
    protected loadedUserId2Picks: Map<string, string[]> = new Map();

    protected columns: TableColumn<DiscordUser>[] = [
        new TableColumn<DiscordUser>(
            'position',
            '',
            null,
            false,
            (element: DiscordUser, index: number) => index + 1,
            (element: DiscordUser, index: number) => null
        ),
        new SimpleTableColumn<DiscordUser>('img', '', user => user.getAvatarImageUrl(), null, true),
        new SimpleTableColumn<DiscordUser>('name', 'Name', user => user.global_name || user.username),
        new SimpleTableColumn<DiscordUser>('pick1', 'I', user => this.getPick(user, 0)),
        new SimpleTableColumn<DiscordUser>('pick2', 'II', user => this.getPick(user, 1)),
        new SimpleTableColumn<DiscordUser>('pick3', 'III', user => this.getPick(user, 2)),
        new SimpleTableColumn<DiscordUser>('pick4', 'IV', user => this.getPick(user, 3)),
        new SimpleTableColumn<DiscordUser>('pick5', 'V', user => this.getPick(user, 4)),
    ];

    @ViewChild(MatSort) sort!: MatSort;

    ngOnInit() {
        this.tableData.sortingDataAccessor = (item: DiscordUser, property: string): string | number => {
            switch (property) {
                case 'avatar':
                    return item.global_name || item.username;
                case 'name':
                    return item.global_name || item.username;
                case 'global_name':
                    return item.global_name;
                case 'username':
                    return item.username;
                case 'id':
                    return item.id;
                case 'discriminator':
                    return item.discriminator;
                default:
                    return '';
            }
        };
        this.mcSignupService.getAllRegisteredUser$().subscribe(users => {
            this.loadedUsers = users;
            console.log('All registered users:', users);
            this.tableData.data = users;
            if (this.sort) {
                this.tableData.sort = this.sort;
            }
        });
        this.mcSignupService.getAllSignups$().subscribe(signups => {
            signups.forEach(signup => {
                this.loadedUserId2Picks.set(signup.discord_id, signup.picks);
            });
        });
    }

    ngAfterViewInit() {
        this.tableData.sort = this.sort;
    }

    getUsers(): DiscordUser[] {
        return this.loadedUsers;
    }

    getPick(user: DiscordUser, pickNumber: number): string {
        if (pickNumber < 0) {
            throw new Error('pickNumber must be >= 0');
        }
        const picks = this.loadedUserId2Picks.get(user.id);
        if (picks && picks.length >= pickNumber) {
            return picks[pickNumber];
        }
        return "-";
    }
}
