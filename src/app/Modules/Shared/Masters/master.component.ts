import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule ,FormControl } from '@angular/forms';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-master',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './master.component.html',
  styleUrl: './master.component.css'
})
export class MasterComponent implements OnInit, OnChanges {
  @Input() formTitle: string = 'Master Form';
@Input() fields: {
  label: string;
  name?: string; 
  type: string;
  required?: boolean;
  validators?: string[]; 
  options?: { id: number; label: string }[]; // <-- Fix here
  optionsSource?: string;
  rowWidth?: number;
}[] = [];
  @Input() initialData: any = null;

  @Output() formSubmit = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  masterForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    console.log('✅ MasterComponent loaded');
  }

  ngOnInit(): void {
    if (this.fields?.length) {
      this.buildForm();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fields'] && changes['fields'].currentValue?.length) {
      this.buildForm();
    }

    if (changes['initialData'] && this.masterForm) {
      this.masterForm.patchValue(this.initialData || {});
    }
  }
 buildForm(): void {
  const group: { [key: string]: FormControl } = {};

  this.fields
    .filter(field => !!field.name)
    .forEach(field => {
      const validators = [];

      if (field.required) {
        validators.push(Validators.required);
      }

      if (field.validators) {
        field.validators.forEach(v => {
          if (v.startsWith('pattern:')) {
            const pattern = v.split('pattern:')[1];
            validators.push(Validators.pattern(pattern));
          }
          if (v === 'email') {
            validators.push(Validators.email);
          }
        });
      }

      // Set default value
      let defaultValue: any = '';
      if (field.type === 'dropdown') {
  defaultValue = this.initialData?.[field.name!] ?? 0;

  // Validator: value must not be 0, null, or empty
  if (field.required){
  validators.push((control: AbstractControl) => {
    const invalidValues = [0, null, '', undefined];
    return invalidValues.includes(control.value) ? { required: true } : null;
    
  });
} }else {
  defaultValue = this.initialData?.[field.name!] ?? '';
}

      // if (field.type === 'dropdown') {
      //   defaultValue = this.initialData?.[field.name!] ?? 0;

      //   if (field.required) {
      //     // Custom validator to reject 0 as valid selection
      //     validators.push((control: AbstractControl) =>
      //       control.value === 0 ? { invalidSelection: true } : null
      //     );
      //   }
      // } else {
      //   defaultValue = this.initialData?.[field.name!] ?? '';
      // }

      group[field.name!] = new FormControl(defaultValue, validators);
    });

  this.masterForm = this.fb.group(group);
}
  // buildForm(): void {
  //   console.log('⛏ building form with fields:', this.fields);
  //   const group: any = {};
  //   this.fields.forEach(field => {
  //     group[field.name] = [
  //       this.initialData ? this.initialData[field.name] : null,
  //       field.required ? Validators.required : []
  //     ];
  //   });

  //   this.masterForm = this.fb.group(group);
  // }

  // onSubmit(): void {
  //   if (this.masterForm.valid) {
  //     this.formSubmit.emit(this.masterForm.value);
  //     this.masterForm.reset();
  //   } else {
  //     this.masterForm.markAllAsTouched();
  //   }
  // }
 onSubmit(): void {
    if (this.masterForm.valid) {
      const filteredData: any = {};
      this.fields
        .filter(field => !!field.name)
        .forEach(field => {
          filteredData[field.name!] = this.masterForm.get(field.name!)?.value;
        });

      this.formSubmit.emit(filteredData);
      this.masterForm.reset();
    } else {
      this.masterForm.markAllAsTouched();
    }
  }
  cancelEdit(): void {
    this.masterForm.reset();
    this.cancel.emit();
  }
   allowOnlyNumbers(event: KeyboardEvent): void {
  const charCode = event.key;

  // Allow only digits 0-9
  if (!/^\d$/.test(charCode)) {
    event.preventDefault();
    alert('Only numeric values are allowed');
  }
}
}