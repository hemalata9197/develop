import { Component, OnInit } from '@angular/core';
import { FireDrillService } from '../../../Services/fire-drill.service';

@Component({
  selector: 'app-form-builder',
  imports: [],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.css'
})
export class FormBuilderComponent  {}
// export class FormBuilderComponent implements OnInit {
//   sections: any[] = [];

//   constructor(private FireDrillService: FireDrillService) {}

//   ngOnInit(): void {
//     this.loadForm();
//   }

//   loadForm() {
//     this.FireDrillService.getSectionsWithFields().subscribe(data => this.sections = data);
//   }

//   addSection() {
//     const name = prompt('Enter section name');
//     if (!name) return;

//     const section = {
//       sectionName: name,
//       sectionOrder: this.sections.length + 1,
//       isRepeatable: false
//     };
//     this.FireDrillService.addSection(section).subscribe(() => this.loadForm());
//   }

//   addField(sectionId: number) {
//     const label = prompt('Enter field label');
//     if (!label) return;

//     const field = {
//       sectionId,
//       label,
//       name: label.toLowerCase().replace(/\s+/g, '_'),
//       type: 'textbox',
//       placeholder: '',
//       orderIndex: 1,
//       isRepeatable: false,
//       dropdownSource: '',
//       validations: []
//     };
//     this.FireDrillService.addField(field).subscribe(() => this.loadForm());
//   }

//   deleteField(id: number) {
//     if (confirm('Are you sure?')) {
//       this.FireDrillService.deleteField(id).subscribe(() => this.loadForm());
//     }
//   }

//   deleteSection(id: number) {
//     if (confirm('Delete section and all its fields?')) {
//       this.FireDrillService.deleteSection(id).subscribe(() => this.loadForm());
//     }
//   }
// }