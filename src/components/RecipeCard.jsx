import React from "react";

const RecipeCard = ({ recipe, onDeleteRecipe, onEditRecipe }) => {
  return (
    <div className="recipe-card">
      <div className="recipe-header">
        <h3>{recipe.title}</h3>

        <div>
          <button
            className="recipe-edit-btn"
            onClick={() => onEditRecipe(recipe.id)}
          >
            Edit
          </button>
          <button 
            className="recipe-delete-btn"
            onClick={() => onDeleteRecipe(recipe.id)}
          >
            Delete
          </button>
        </div>
      </div>

      <div className="recipe-info">
        <p><strong>Prep:</strong> {recipe.prepTime} min</p>
        <p><strong>Servings:</strong> {recipe.servings}</p>
        <p>
          <strong>Tags:</strong>{" "}
          {recipe.tags.length > 0 ? recipe.tags.join(", ") : "No tags"}
        </p>
        <p><strong>Ingredients:</strong> {recipe.ingredients.length}</p>
      </div>
    </div>
  );
};

export default RecipeCard;
