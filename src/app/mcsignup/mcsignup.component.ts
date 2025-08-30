import { Component, inject, ViewChild, OnInit, OnDestroy, HostListener } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PolygonSelectComponent } from '../polygon-select/polygon-select.component';
import { RendererConfigProvider } from '../polygon-select/RendererConfigProvider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MapService } from '../map.service';
import { DiscordLoginComponent } from '../discord-login/discord-login.component';
import { DiscordAuthenticationService } from '../services/discord-auth.service';
import { DiscordFieldComponent } from '../discord-field/discord-field.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CK3Service } from '../services/gamedata/CK3Service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SignupAssetsService, SignupAssetsData } from './SignupAssetsService';

export interface TableItem {
    key: string;
    name: string;
}

@Component({
    selector: 'app-mcsignup',
    imports: [PolygonSelectComponent, DiscordLoginComponent, MatButtonModule, MatIconModule, MatTableModule, DragDropModule, DiscordFieldComponent, MatProgressSpinnerModule],
    templateUrl: './mcsignup.component.html',
    styleUrl: './mcsignup.component.scss'
})
export class MCSignupComponent implements OnInit {

    @ViewChild(PolygonSelectComponent) polygonSelectComponent!: PolygonSelectComponent;

    private readonly MAX_SELECTIONS = 5;
    private _snackBar = inject(MatSnackBar);

    displayedColumns: string[] = ['index', 'value'];
    dataSource: TableItem[] = [];

    selectionCallback = this.onSelect.bind(this);

    configProvider: RendererConfigProvider;

    constructor(private mapService: MapService, protected discordAuthService: DiscordAuthenticationService, private ck3Service: CK3Service, private signupAssetsService: SignupAssetsService) {
        const colorMap = new Map<string, number>();
        this.configProvider = new RendererConfigProvider(colorMap);
    }

    ngOnInit() {
        /*
        this.ck3Service.downloadJsonFromFileUrl("https://codingafterdark.de/ck3/" + "/common/landed_titles/00_landed_titles.txt", "landed_titles.json").subscribe({
            next: () => {
                console.log("Downloaded landed titles JSON");
            },
            error: (error) => {
                console.error("Error downloading landed titles JSON:", error);
            }
        });
        */
        this.signupAssetsService.loadMapData().subscribe({
            next: (data: SignupAssetsData) => {
                if (this.polygonSelectComponent) {
                    this.initializeMapWithData(data);
                }
            },
            error: (error) => {
                console.error('Error loading map data:', error);
            }
        });
        /*
        const fileNames = ["Lombardy", "Sicily", "Iberia", "Maghreb", "WestAfrica", "Egypt"];
        const regionLists = new Map<string, any[]>();
        fileNames.forEach(async (name) => {
            const response = await fetch(`http://127.0.0.1:5500/public/regions/${name}.json`);
            if (response.ok) {
                const json = await response.json();
                regionLists.set(name, json ?? []);
                console.log(regionLists);
            }
        });
        */
    }

    ngAfterViewInit() {
        setTimeout(() => {
            this.initializeMap();
        }, 100);
    }

    private initializeMap() {
        if (!this.polygonSelectComponent) {
            setTimeout(() => this.initializeMap(), 100);
            return;
        }
        if (this.isDataReady()) {
            const data = this.signupAssetsService.getCurrentData();
            if (data) {
                this.initializeMapWithData(data);
            }
        }
    }

    private initializeMapWithData(data: SignupAssetsData) {
        if (!this.polygonSelectComponent || !data.meshes || !data.configProvider) {
            return;
        }

        this.configProvider = data.configProvider;
        this.polygonSelectComponent.setMeshes(data.meshes);
        
        setTimeout(() => {
            this.polygonSelectComponent.forceResize();
            this.polygonSelectComponent.fitCameraToPolygons(0.1);
        }, 100);
        setTimeout(() => {
            this.polygonSelectComponent.forceResize();
        }, 500);

        const stats = this.signupAssetsService.getMeshStatistics(data.meshes);
        console.log(`Loaded ${stats.meshCount} polygon meshes with ${stats.triangleCount.toLocaleString()} triangles total`);
    }

    drop(event: CdkDragDrop<TableItem[]>) {
        moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
        this.dataSource = [...this.dataSource];
    }

    onSelect(key: string, locked: boolean) {
        if (this.dataSource.length == this.MAX_SELECTIONS && locked) {
            this.polygonSelectComponent.setLockedState(key, false, false);
            this.openSnackBar("Maximum selections reached!", "OK");
            return;
        }
        if (locked) {
            this.dataSource = this.dataSource.concat([{ key: key, name: key }]);
        } else {
            this.dataSource = this.dataSource.filter(item => item.key !== key);
        }
    }

    register() {
        console.log("REGISTER")
    }

    canRegister() {
        return this.discordAuthService.isLoggedIn() && this.dataSource.length == this.MAX_SELECTIONS;
    }

    @HostListener('window:resize', ['$event'])
    onWindowResize(event: any) {
        if (this.polygonSelectComponent) {
            this.polygonSelectComponent.forceResize();
        }
    }

    openSnackBar(message: string, action: string) {
        this._snackBar.open(message, action, {
            duration: 3000,
        });
    }

    isDataReady() {
        return this.signupAssetsService.isDataReady();
    }

    isLoading() {
        return this.signupAssetsService.isLoading();
    }
}