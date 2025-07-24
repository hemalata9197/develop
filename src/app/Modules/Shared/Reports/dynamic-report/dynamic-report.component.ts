import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dynamic-report',
   standalone: true,
  imports: [CommonModule],
  templateUrl: './dynamic-report.component.html',
  styleUrl: './dynamic-report.component.css'
})
export class DynamicReportComponent implements OnChanges {
  @Input() title = '';
  @Input() columns: { key: string; label: string }[] = [];
  @Input() data: any[] = [];

  visibleColumns: string[] = [];

   ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns']) {
      this.visibleColumns = this.columns.map(c => c.key);
    }
  }


  toggleColumn(key: string) {
    this.visibleColumns = this.visibleColumns.includes(key)
      ? this.visibleColumns.filter(c => c !== key)
      : [...this.visibleColumns, key];
  }
}
