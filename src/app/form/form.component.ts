import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Action } from '@ngrx/store';
import { IFormState } from '../store/state/app.state';

@Component({
  selector: 'piotrek-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  @Input() form: IFormState; // We pass the form's state as the input
  @Output() actionsEmitted: EventEmitter<Action[]> = new EventEmitter(); // ...and emit actions that should change the state.

  constructor() { }
  myForm: FormGroup = new FormGroup({
    name: new FormControl('')
  });

  ngOnInit() {
  }

}
