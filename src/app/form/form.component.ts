import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Action } from '@ngrx/store';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { IFormState } from '../store/state/form.state';
import { formNameChanged, formSetValidity } from '../store/actions/form.actions';

@Component({
  selector: 'piotrek-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit, OnChanges {

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
        name: new FormControl(this.form.name, {
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
        this.myForm.controls['name']
            .valueChanges.pipe(distinctUntilChanged())
            .subscribe((value) => {
                this.actionsEmitted.emit([formNameChanged(value)]);
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
        this.myForm.controls['name'].setValue(changes.form.currentValue.name);
    }

}
