import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IEntity } from '../../models/entity.interface';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-entities',
    templateUrl: './entities.component.html',
    styleUrls: ['./entities.component.css']
})
export class EntitiesComponent implements OnInit {
    @Input() entities: IEntity[];
    @Output() entitySelected: EventEmitter<Object> = new EventEmitter();

    constructor(private theme: ThemeService) {
        
     }

    ngOnInit() { }

    navigateToEntity(entity: Object) {
            this.entitySelected.emit(entity);
    }

}
