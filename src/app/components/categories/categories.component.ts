import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ICategory } from '../../models/category.interface';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-categories',
    templateUrl: './categories.component.html',
    styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
    @Input() categories: ICategory[];
    @Output() categorySelected: EventEmitter<Object> = new EventEmitter();

    constructor(private theme: ThemeService) { }

    ngOnInit() { }

    navigateToCategory(category: Object) {
            this.categorySelected.emit(category);
    }

}
