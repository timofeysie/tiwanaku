import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Action } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { IFormState } from '../store/state/form.state';
import { formCategoryChanged, formSetValidity } from '../store/actions/form.actions';
import { MatSelectModule } from '@angular/material';

/**
*lang=en&category=fallacies&wdt=P31&wd=Q186150
*/
@Component({
  selector: 'piotrek-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnChanges {
    categories = [
        {
          label: 'cognitive_bias',
          wdt: 'P31',
          wd: 'Q29598',
          language: 'en'
        }, {
          label: 'fallacies',
          wdt: 'P31',
          wd: 'Q186150',
          language: 'en'
      }
    ];
    catObject = this.categories[0];
    @Input() form: IFormState = { isValid: false, isDirty: false };
    @Output() actionsEmitted: EventEmitter<Action[]> = new EventEmitter();
    @Output() formSubmitted: EventEmitter<{}> = new EventEmitter();

    constructor() { }

    /**
     * micro-optimization:
     * the event on valueChanges stream will be fired only on focus-out,
     * instead of every key press
     */
    myForm: FormGroup = new FormGroup({
        category: new FormControl(this.form.category, {
            updateOn: 'blur',
            validators: [
                Validators.required,
                Validators.maxLength(10)
            ]
        })
    });

    onSubmit() {
        this.formSubmitted.next();
    }

    ngOnInit() {
        this.myForm.controls['category']
            .valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.actionsEmitted.emit([formCategoryChanged(value)]);
        });
        this.myForm
            .statusChanges
            .pipe(
              distinctUntilChanged(),
              map(status => status === 'VALID'))
            .subscribe(isValid => {
              this.actionsEmitted.emit([formSetValidity(isValid)]);
        });
    }

    /**
     * Whenever input changes (and input is the form's state in the store),
     * we update the value of the control.
     */
    ngOnChanges(changes: SimpleChanges) {
        if (!changes.form || changes.form.isFirstChange()) {
            return;
        }
        this.myForm.controls['category'].setValue(changes.form.currentValue.category);
    }

}
