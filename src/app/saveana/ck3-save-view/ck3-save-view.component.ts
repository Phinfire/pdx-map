import { Component, inject, Input } from '@angular/core';
import { Ck3Save } from '../../../model/Ck3Save';
import { Title } from '@angular/platform-browser';
import { TableComponent } from '../../vic3-country-table/vic3-country-table.component';
import { SimpleTableColumn } from '../../../util/table/SimpleTableColumn';
import { Ck3Player } from '../../../model/ck3/Player';
import { TableColumn } from '../../../util/table/TableColumn';
import { Character } from '../../../model/ck3/Character';
import { MatTabsModule } from '@angular/material/tabs';
import { CK3TableColumnProvider } from '../../../saveana/CK3TableColumnProvider';
import { SimplifiedDate } from '../../../model/common/SimplifiedDate';
import { SlabMapViewComponent } from '../../slab-map-view/slab-map-view.component';

@Component({
    selector: 'app-ck3-save-view',
    imports: [TableComponent, MatTabsModule, SlabMapViewComponent],
    templateUrl: './ck3-save-view.component.html',
    styleUrl: './ck3-save-view.component.scss'
})
export class Ck3SaveViewComponent {

    private titleService = inject(Title);
    protected rowElements: Ck3Player[] = [];
    protected columnMap: Map<string, TableColumn<Ck3Player>[]> = this.buildColumnMap();

    @Input() activeSave!: Ck3Save;

    ngOnInit() {
        if (this.activeSave) {
            const dateString = SimplifiedDate.fromDate(this.activeSave.getCurrentIngameDate()).getDateWithShortenedMonthName();
            this.titleService.setTitle(dateString);
            this.rowElements = this.activeSave.getPlayers();
        }
    }

    buildColumnMap() {
        return new Map(Array.from(new CK3TableColumnProvider().getCharacterColumns(), 
            ([key, value]) => [key, [new SimpleTableColumn<Ck3Player>("name", "Player", player => player.getName()), ...value.map(c => this.wrap(c))]]));
    }

    getRowElements() {
        return this.rowElements;
    }

    private wrap(column: TableColumn<Character>) {
        return TableColumn.wrapColumn(column, (p: Ck3Player) =>{
            if (p.getLastPlayedCharacter() && p.getLastPlayedCharacter()!.isAlive()) {
                return p.getLastPlayedCharacter();
            }
            return null;
        });
    }
}