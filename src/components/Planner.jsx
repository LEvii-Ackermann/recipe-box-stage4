import React, {useEffect, useState} from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const Planner = ({ recipes, planner, setPlanner }) => {

  const [removedRecipe, setRemovedRecipe] = useState(null);

  const addRecipeToDay = (day, recipeId) => {
    if (!recipeId) {
      return;
    }

    const id = Number(recipeId);
    
    setPlanner((prevPlanner) => ({
      ...prevPlanner,
      [day]: [...prevPlanner[day], id],
    }));
  };

  const removeRecipeFromDay = (day, recipeId, index) => {
    setPlanner((prevPlanner) => ({
        ...prevPlanner,
        [day]: prevPlanner[day].filter((_, i) => i !== index),
    }))

    setRemovedRecipe({
      day,
      index,
      recipeId
    })
  }

  const undoRemoveRecipe = () => {
    if (!removedRecipe) {
      return;
    }

    const recipeExists = recipes.some((recipe) => recipe.id === removedRecipe.recipeId);

    if (!recipeExists) {
      setRemovedRecipe(null);
      return;
    }

    setPlanner((prevPlanner) => {
      const updatedDay = [...prevPlanner[removedRecipe.day]]

      updatedDay.splice(removedRecipe.index, 0, removedRecipe.recipeId)

      return {
        ...prevPlanner,
        [removedRecipe.day]: updatedDay,
      }
    })

    setRemovedRecipe(null);
  }

  useEffect(() => {
    if (!removedRecipe) {
      return;
    }

    const timer = setTimeout(() => {
      setRemovedRecipe(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [removedRecipe]);

  // Effect to remove the toast if the recipe is deleted from the recipes list
  useEffect(() => {
    if (!removedRecipe) {
      return;
    }

    const recipeExists = recipes.some(
      (recipe) => recipe.id === removedRecipe.recipeId
    );

    if (!recipeExists) {
      setRemovedRecipe(null);
    }
  }, [recipes, removedRecipe]);

  return (
    <section className="planner">
      <h2>Weekly Meal Planner</h2>

      <div className="planner-grid">
        {days.map((day) => (
          <div className="planner-day" key={day}>
            <h3>{day}</h3>

            <select
              value=""
              onChange={(e) => addRecipeToDay(day, e.target.value)}
            >
              <option value="">Add Recipe</option>

              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.title}
                </option>
              ))}
            </select>

            <div className="planned-recipes">
              {planner[day].map((recipeId, index) => {
                const recipe = recipes.find(
                  (item) => item.id === recipeId
                );

                if (!recipe) {
                  return null;
                }

                return (
                  <div className="planned-recipe" key={`${recipeId}-${index}`}>
                    <span>{recipe.title}</span>

                    <button
                    type="button"
                    onClick={() => removeRecipeFromDay(day, recipeId, index)}
                    >
                    Remove
                    </button>
                </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {removedRecipe && (
        <div className="planner-undo-bar">
          <span>Recipe removed from {removedRecipe.day}</span>

          <button type="button" onClick={undoRemoveRecipe}>
            Undo
          </button>
        </div>
      )}
    </section>
  );
};

export default Planner;