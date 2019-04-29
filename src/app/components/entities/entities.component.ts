import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IEntity } from '../../models/entity.interface';

@Component({
    selector: 'app-entities',
    templateUrl: './entities.component.html',
    styleUrls: ['./entities.component.css']
})
export class EntitiesComponent implements OnInit {
    @Input() entities: IEntity[];
    @Output() entitySelected: EventEmitter<Object> = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    navigateToEntity(entity: Object) {
            this.entitySelected.emit(entity);
    }

}
