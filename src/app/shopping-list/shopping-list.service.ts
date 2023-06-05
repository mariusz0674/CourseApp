import {EventEmitter, Injectable} from '@angular/core';
import {Ingredient} from "../shared/ingredient.model";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  subscription = new Subject<Ingredient[]>();
  private ingredients: Ingredient[] = [
    new Ingredient('Apples', 5),
    new Ingredient('Tomatoes', 69),
  ];
  constructor() { }

  getIngredients() {
    return this.ingredients.slice();
  }

  addIngredient(ingredient: Ingredient) {
    this.ingredients.push(ingredient);
    this.subscription.next(this.ingredients.slice());
  }

  addIngredients(ingredients: Ingredient[]) {
    this.ingredients.push(...ingredients); // ... is the spread operator
    this.subscription.next(this.ingredients.slice());
  }
}
