import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {Recipe} from "../recipe.model";
import {RecipeService} from "../recipe.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html',
  styleUrls: ['./recipe-list.component.css']
})
export class RecipeListComponent implements OnInit, OnDestroy{
  recipes: Recipe [] = [];
  recipeChangesSubscription: Subscription;

  constructor(private recipeService: RecipeService,
              private route: ActivatedRoute,
              private router: Router
             ) { }

  ngOnInit(): void {
    this.recipes = this.recipeService.getRecipes();
    this.recipeChangesSubscription = this.recipeService.recipesChanged.subscribe(
      (recipes: Recipe[]) =>{
        this.recipes = recipes;
      }
    );
  }

  onNewRecipe() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  ngOnDestroy(): void {
    this.recipeChangesSubscription.unsubscribe();
  }
}
