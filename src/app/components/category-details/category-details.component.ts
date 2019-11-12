import { Component, OnInit, Input } from '@angular/core';
import { ICategory } from '../../models/category.interface';


@Component({
  selector: 'app-category-details',
  templateUrl: './category-details.component.html',
  styleUrls: ['./category-details.component.css']
})
export class CategoryDetailsComponent implements OnInit {
  @Input() category: ICategory;

  constructor() { }

  ngOnInit() { }
}
