import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-transaction-add',
  templateUrl: './transaction.add.component.html',
  styleUrls: ['./transaction.add.component.css']
})
export class TransactionAddComponent {
  form: FormGroup;
  visible: boolean = false; // controls modal visibility

  @Output() submitted = new EventEmitter<any>(); // emits form data to parent

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      category: [null],  // nullable
      currency: ['', [Validators.required, Validators.maxLength(5)]],
      type: ['', [Validators.required, Validators.maxLength(10)]],
      amount: [null, [Validators.required]],
      description: [''],  // nullable
      date: ['', Validators.required]
    });
  }

  // open the modal (optional: pass a transaction to prefill)
  openModal(transaction?: any) {
    if (transaction) {
      this.form.patchValue(transaction);
    } else {
      this.form.reset();
    }
    this.visible = true;
  }

  closeModal() {
    this.visible = false;
  }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit(this.form.value);
      this.closeModal();
    }
  }
}
