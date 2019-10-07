import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'piotrek-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  constructor() { }
  myForm: FormGroup = new FormGroup({
    name: new FormControl('')
  });

  ngOnInit() {
  }

}
