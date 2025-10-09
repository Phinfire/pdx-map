import * as d3 from 'd3';
import { Component, OnInit, ElementRef, Inject, inject, Input, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Plotable } from './plot/Plotable';
import { PlottingService } from './PlottingService';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
    selector: 'app-plot-view',
    imports: [MatButtonModule, MatIcon, MatMenuModule],
    templateUrl: './plot-view.component.html',
    styleUrl: './plot-view.component.scss'
})
export class PlotViewComponent {

    plottingService = inject(PlottingService);

    plotables: Plotable[] = [];
    plotType: string | null = null;
    title: string | null = null;
    previousPlot: SVGSVGElement | null = null;

    @Input() plotablesInput: Plotable[] = [];

        downloadPlotAsSVG() {
            if (!this.previousPlot) return;
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(this.previousPlot);
            const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = (this.title || 'plot') + '.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        downloadPlotAsPNG() {
            if (!this.previousPlot) return;
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(this.previousPlot);
            const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            // Get width/height from SVG attributes
            const width = this.previousPlot.width.baseVal.value || 800;
            const height = this.previousPlot.height.baseVal.value || 500;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob(blob => {
                        if (blob) {
                            const pngUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = pngUrl;
                            a.download = (this.title || 'plot') + '.png';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(pngUrl);
                        }
                    }, 'image/png');
                }
                URL.revokeObjectURL(url);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
            };
            img.src = url;
        }

    constructor(
        @Optional() @Inject(MAT_DIALOG_DATA) private data: { plotables: Plotable[], plotType: string, title: string } | null,
        private elementRef: ElementRef
    ) {
        if (data) {
            this.plotables = data.plotables.sort((a, b) => b.value - a.value);
            this.plotType = data.plotType;
            this.title = data.title;
        } else {
            this.plotables = this.plotablesInput;
        }
    }

    ngAfterViewInit() {
        this.redrawPlot();
    }

    ngOnChanges() {
        if (this.plotablesInput) {
            this.plotables = this.plotablesInput;
            this.plotType = null;
            this.redrawPlot();
        }
    }

    private redrawPlot() {
        if (this.previousPlot) {
            this.previousPlot.remove();
        }
        if (this.elementRef && this.elementRef.nativeElement) {
            if (this.plotables && this.plotables.length > 0) {
                if (this.plotType === 'bar') {
                    this.previousPlot = this.plottingService.drawBarPlot(this.plotables, this.elementRef.nativeElement, false, true);
                } else if (this.plotType === 'pie') {
                    this.previousPlot = this.plottingService.pieChart(this.plotables, this.elementRef.nativeElement);
                }
            }
        } else {
            console.warn("No elementRef or nativeElement in PlotViewComponent");
        }
    }
}
