import React from "react";
import RecipeCard from "./RecipeCard.jsx";

const RecipeList = ({ recipes, totalRecipes, onDeleteRecipe, onEditRecipe }) => {
  if (totalRecipes === 0) {
    return (
      <section className="recipe-list">
        <h2>Recipes</h2>

        <p>No recipes added yet.</p>
      </section>
    );
  }

  if(recipes.length === 0) {
    return (
      <section className="recipe-list">
        <h2>Recipes</h2>

        <p>No recipes match your search or filter.</p>
      </section>
    )
  }

  return (
    <section className="recipe-list">
        <h2>Recipes</h2>

        <div className="recipe-grid">
          {recipes.map((recipe) => (
              <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onDeleteRecipe={onDeleteRecipe}
                  onEditRecipe={onEditRecipe}
              />
          ))}
      </div>
    </section>
  )
};

export default RecipeList;
