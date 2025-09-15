import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { SaveViewComponent } from '../save-view/save-view.component';
import { Ck3SaveViewComponent } from '../saveana/ck3-save-view/ck3-save-view.component';
import { CK3Service } from '../../services/gamedata/CK3Service';
import { Ck3Save } from '../../model/Ck3Save';
import { Vic3Save } from '../../model/vic/Vic3Save';
import { PdxFileService } from '../../services/pdx-file.service';

@Component({
    selector: 'app-save-view-splash',
    imports: [SaveViewComponent, CommonModule, MatButtonModule, Ck3SaveViewComponent],
    templateUrl: './save-view-splash.component.html',
    styleUrl: './save-view-splash.component.scss'
})
export class SaveViewSplashComponent {

    ck3Service = inject(CK3Service);


    hasBeenInitialized = false;
    activeSave?: any;

    @ViewChild('chute') chuteDiv!: ElementRef<HTMLDivElement>;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    constructor(private fileService: PdxFileService, private elementRef: ElementRef, http: HttpClient) {
        /*
        http.get("http://localhost:5500/public/greater elbia_1898_07_06.v3", { responseType: 'text' }).subscribe(data => {
            this.processVicFile([new File([data], "testsave.v3")]);
        });
        */
        /*
        http.get("http://localhost:5500/public/MY Emperor_Havel_of_Greater_Elbia_1208_03_24.ck3", { responseType: 'text' }).subscribe(data => {
            this.processFiles([new File([data], "testsave.ck3")]);
        });
        */
       
        const time = performance.now();
        this.ck3Service.openCk3SaveFromFile("http://localhost:5500/public/Duke_Friedrich_II_of_Lower_Lotharingia_1107_07_25.ck3").subscribe(save => {
            this.activeSave = save;
            this.hasBeenInitialized = true;
            const seconds = ((performance.now() - time) / 1000).toFixed(2);
            console.log(`Time taken: ${seconds}s`, typeof save, save instanceof Ck3Save);
        });
        
    }

    activeSaveIsVic3() {
        return this.activeSave instanceof Vic3Save;
    }

    activeSaveIsCk3() {
        return this.activeSave instanceof Ck3Save;
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.files.length > 0) {
            const files = Array.from(event.dataTransfer.files);
            this.processVicFile(files);
        }
    }

    private processVicFile(files: File[]) {
        this.fileService.importFilesPromise(files).then(namesAndJsons => {
            const first = namesAndJsons[0];
            console.log("Imported file", first.name, first.json);
            this.activeSave = Vic3Save.makeSaveFromRawData(first.json);
            this.hasBeenInitialized = true;
            this.showHoverActiveIndicator(false);
        }).catch(error => {
            this.showError(`Error: ${error.message}`);
            this.showHoverActiveIndicator(false);
        });
    }

    private showError(message: string) {
        if (this.chuteDiv?.nativeElement?.firstChild) {
            this.chuteDiv.nativeElement.firstChild!.textContent = message;
        }
    }

    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.showHoverActiveIndicator(true);
    }

    onDragLeave(event: DragEvent) {
        event.preventDefault();
        this.showHoverActiveIndicator(false);
    }

    onDragEnd(event: DragEvent) {
        event.preventDefault();
        this.showHoverActiveIndicator(false);
    }

    showHoverActiveIndicator(hatch: boolean) {
        this.chuteDiv.nativeElement.classList.toggle('chute-active', hatch);
        this.elementRef.nativeElement.style.backgroundImage = hatch ? 'repeating-linear-gradient(45deg, #000 0, #000 10px, transparent 10px, transparent 20px)' : 'none';

    }

    openFileDialog() {
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const files = Array.from(input.files);
            this.processVicFile(files);
        }
    }
}
