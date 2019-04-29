import { Component, OnInit, Input } from '@angular/core';
import { IEntity } from '../../models/entity.interface';

@Component({
  selector: 'app-entity-details',
  templateUrl: './entity-details.component.html',
  styleUrls: ['./entity-details.component.css']
})
export class EntityDetailsComponent implements OnInit {
  @Input() entity: IEntity;

  constructor() { }

  ngOnInit() {
    console.log('entity',this.entity);
  }
}
