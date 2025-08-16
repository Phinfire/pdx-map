import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PolygonSelectComponent } from '../polygon-select/polygon-select.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

export interface TableItem {
  value: string;
}

@Component({
    selector: 'app-mcsignup',
    imports: [PolygonSelectComponent, MatButtonModule, MatIconModule, MatTableModule, DragDropModule],
    templateUrl: './mcsignup.component.html',
    styleUrl: './mcsignup.component.scss'
})
export class MCSignupComponent {
    displayedColumns: string[] = ['index', 'value'];
    dataSource: TableItem[] = [
        { value: 'First Item' },
        { value: 'Second Item' },
        { value: 'Third Item' },
        { value: 'Fourth Item' },
        { value: 'Fifth Item' }
    ];

    drop(event: CdkDragDrop<TableItem[]>) {
        moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
    }
}