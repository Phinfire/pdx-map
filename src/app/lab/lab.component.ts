import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { Jomini } from "jomini";
import { CK3Service } from "../../services/gamedata/CK3Service";
import { TableColumn } from "../../util/table/TableColumn";
import { Ck3Player } from "../../model/ck3/Player";
import { Ck3Save } from "../../model/Ck3Save";

@Component({
    selector: 'app-lab',
    imports: [MatButtonModule, MatDividerModule, MatIconModule],
    templateUrl: './lab.component.html',
    styleUrl: './lab.component.scss'
})
export class LabComponent {

    save: Ck3Save | null = null;

    constructor(private ck3Service: CK3Service, private http: HttpClient) {
    }

    ngOnInit() {
        console.log("Jomini object:", Jomini);
        console.log("Jomini initialize:", typeof Jomini.initialize);
        /*
        this.ck3Service.initializeCK3().subscribe({
            next: (ck3) => {
                console.log("CK3 service initialized, fetching file...");
                //this.http.get("http://localhost:5500/public/Duke_salomoun_of_Lausitz_1120_08_21.ck3", { responseType: 'arraybuffer' }).subscribe({
                    this.http.get("http://localhost:5500/public/Emperor_Havel_of_Greater_Elbia_1208_03_24.ck3", { responseType: 'arraybuffer' }).subscribe({
                    next: async (data) => {
                        console.log("File downloaded, size:", data.byteLength);
                        try {
                            console.log("Starting ZIP extraction...");
                            const zip = new JSZip();
                            const zipContents = await zip.loadAsync(data);
                            
                            console.log("ZIP loaded, files inside:", Object.keys(zipContents.files));
                            
                            // Extract the gamestate file
                            const gamestateFile = zipContents.files['gamestate'];
                            if (!gamestateFile) {
                                console.error("No 'gamestate' file found in ZIP. Available files:", Object.keys(zipContents.files));
                                return;
                            }
                            
                            console.log("Extracting gamestate file...");
                            const gamestateContent = await gamestateFile.async('text');
                            console.log("Gamestate extracted, starting parse...");

                            const parser = await Jomini.initialize();
                            const startTime = Date.now();
                            
                            const parsedData = parser.parseText(gamestateContent, {}, (query) => {
                                return {
                                    played_character: query.at("/played_character"),
                                    living: query.at("/living"),
                                    dead_unprunable: query.at("/dead_unprunable"),
                                    dead_prunable: query.at("/dead_prunable"),
                                    dynasties: query.at("/dynasties"),
                                    culture_manager: query.at("/culture_manager"),
                                    religion: query.at("/religion"),
                                };
                            });
                            const endTime = Date.now();
                            console.log(`✅ Parsing completed in ${(endTime - startTime) / 1000} seconds`);
                            
                            this.save = Ck3Save.fromRawData(parsedData, ck3);
                        } catch (e) {
                            console.error("Error processing save data:", e);
                            if (e instanceof Error) {
                                console.error("Error stack:", e.stack);
                            }
                        }
                    },
                    error: (error) => {
                        console.error("Error fetching data:", error);
                    }
                });
            },
            error: (error) => {
                console.error("Error initializing CK3 service:", error);
            }
        });
        */
    }

    getColumns() {
        return [
            new TableColumn<Ck3Player>("player", "Player", null, true, (e) => e.getName(), () => null, null),
            new TableColumn<Ck3Player>("character", "Character", null, true, (e) => e.getCurrentCharacter()?.getName(), () => null, null),
            new TableColumn<Ck3Player>("legacysize", "Legacy Size", null, true, (e) => e.getPreviousCharacters().size, () => null, null)
        ];
    }

    getElements() {
        return this.save != null ? this.save.getPlayers() : [];
    }
}