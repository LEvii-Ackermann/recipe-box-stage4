import React, { useState, useEffect } from 'react'

import Header from './components/Header.jsx'
import AddRecipeForm from './components/AddRecipeForm.jsx'
import RecipeList from './components/RecipeList.jsx'
import SearchFilter from './components/SearchFilter.jsx'
import Planner from './components/Planner.jsx'
import Stats from './components/Stats.jsx'
import MealDiscovery from './components/MealDiscovery.jsx'


const migrateRecipes = (recipes) => {
  return recipes.map((recipe) => {
    if(recipe.difficulty === undefined) {
      return recipe;
    }
    const migratedRecipe = {
      ...recipe,
      tags: recipe.difficulty ? [recipe.difficulty] : [],
    }

    delete migratedRecipe.difficulty;
    return migratedRecipe
  })
}

const MIGRATION_KEY = "migration-done";

const defaultPlanner = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: [],
};

const App = () => {

  // Load recipes from localStorage or initialize with an empty array
  const [recipes, setRecipes] = useState(() => {
    try {
      const savedRecipes = localStorage.getItem("recipes");

      if (!savedRecipes) {
        return [];
      }

      const parsedRecipes = JSON.parse(savedRecipes);

      if (!Array.isArray(parsedRecipes)) {
        return [];
      }

      const recipesWithIds = parsedRecipes.map((recipe) => {
        if (!recipe.id) {
          return {
            ...recipe,
            id: Date.now() + Math.random(),
          };
        }

        return recipe;
      });

      const migrationDone = localStorage.getItem(MIGRATION_KEY)

      if(!migrationDone) {
        const migratedRecipes = migrateRecipes(recipesWithIds);

        const migratedTags = [];

        migratedRecipes.forEach((recipe) => {
          recipe.tags.forEach((tag) => {
            if (!migratedTags.includes(tag)) {
              migratedTags.push(tag);
            }
          });
        });

        localStorage.setItem("recipes", JSON.stringify(migratedRecipes));
        localStorage.setItem("tags", JSON.stringify(migratedTags));
        localStorage.setItem(MIGRATION_KEY, "true")

        return migratedRecipes;
      }

      return recipesWithIds
    } catch (error) {
      console.error("Error parsing recipes from localStorage:", error);
      return [];
    }
  });

  const [tags,setTags] = useState(() => {
    try {
      const storedTags = localStorage.getItem("tags")
      
      if(!storedTags){
        return []
      }

      const parsedTags = JSON.parse(storedTags)
      if(!Array.isArray(parsedTags)){
        return []
      }
      
      return parsedTags
        .filter((tag) => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter(Boolean)

    } catch (error) {
      console.error("Error parsing tags from localStorage:", error);
      return [];
    }
  })


  const [planner, setPlanner] = useState(() => {
    const savedPlanner = localStorage.getItem("planner");

    if (!savedPlanner) {
      return {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };
    }

    try {
      const parsedPlanner = JSON.parse(savedPlanner);
      const cleanedPlanner = {...defaultPlanner};

      Object.keys(parsedPlanner).forEach((day) => {
        if(!Array.isArray(parsedPlanner[day])) {
          return;
        }

        cleanedPlanner[day] = parsedPlanner[day].filter((recipeId) => {
          return recipes.some((recipe) => recipe.id === recipeId);
        });
      });
      return cleanedPlanner;
    }
    catch (error) {
      console.error("Error parsing planner from localStorage:", error);
      return {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
        Saturday: [],
        Sunday: [],
      };
    }
  });

  const [editingRecipe, setEditingRecipe] = useState(null);
  const [activeView, setActiveView] = useState("recipes");

  const [searchTerm, setSearchTerm] = useState('');
  const [tagFilter, setTagFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("tag") || "All";
  });


  // Filter recipes based on search term and tag
  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag =
      tagFilter === "All" ||
      recipe.tags.includes(tagFilter);

    return matchesSearch && matchesTag;
  })

  const averagePreparationTime = 
    filteredRecipes.length === 0
      ? 0
      : Math.round(
          filteredRecipes.reduce(
          (sum, recipe) => sum + Number(recipe.prepTime),
          0
          ) / filteredRecipes.length
        );


  const overallAveragePreparationTime =
  recipes.length === 0
    ? 0
    : Math.round(
        recipes.reduce(
          (sum, recipe) => sum + Number(recipe.prepTime),
          0
        ) / recipes.length
      );      

  // To calculate the most used Tag.      
  let mostUsedTag = null;

  for (const tag of tags) {
    const count = recipes.filter((recipe) => 
      recipe.tags.includes(tag)
    ).length;

    if(count > 0 && (!mostUsedTag || count > mostUsedTag.count)) {
      mostUsedTag = {
        tag: tag,
        count: count,
      }
    }
  }


  //To calculate filled planner Days
  const plannerDays = Object.values(planner);

  const plannerFill = plannerDays.filter((day) => {
    return day.length > 0;
  }).length;


  const renameTag = (oldTag, newTag) => {
    const updatedTag = newTag.trim()

    const tagExists = tags.some(
      (tag) =>
        tag.toLowerCase() === updatedTag.toLowerCase()
    );

    if (!updatedTag || tagExists || oldTag.toLowerCase() === updatedTag.toLowerCase()) {
      return false;
    }

    // If the current tag filter is the old tag, update it to the new tag
    if(tagFilter === oldTag) {
      setTagFilter(updatedTag);
    }

    setTags((prevTags) => {
      return prevTags.map((tag) => {
        return tag === oldTag ? updatedTag : tag
      })
    })

    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) => ({
        ...recipe,
        tags: recipe.tags.map((tag) =>
          tag === oldTag ? updatedTag : tag
        ),
      }))
    );

    return true;
  } 
  
  const deleteTag = (tagToDelete) => {

    if(tagFilter === tagToDelete) {
      setTagFilter("All");
    }

    setTags((prevTags) => 
      prevTags.filter((tag) => tag !== tagToDelete)
    );

    setRecipes((prevRecipes) =>
      prevRecipes.map((recipe) => ({
        ...recipe,
        tags: recipe.tags.filter((tag) => tag !== tagToDelete),
      }))
    )
  }
        

  // Function to delete a recipe by its ID
  const deleteRecipe = (recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);

    if(!recipe) {
      return;
    }

    const hasRecipeInPlanner = Object.values(planner).some((day) => {
      return day.includes(recipeId);
    })
    
    if (hasRecipeInPlanner) {
      const confirmDelete = window.confirm(
        `${recipe.title} is planned for one or more days. Deleting this will remove it from planner as well. Are you sure you want to delete it?`
      )
      if (!confirmDelete) {
        return;
      }
    }

    setRecipes((prevRecipes) => {
      return prevRecipes.filter((recipe) => recipe.id !== recipeId);
    })

    setPlanner((prevPlanner) => {
      const updatedPlanner = {};

      const days = Object.keys(prevPlanner);

      days.forEach((day) => {
        updatedPlanner[day] = prevPlanner[day].filter((id) => id !== recipeId);
      });

      return updatedPlanner;
    })

    if (editingRecipe && editingRecipe.id === recipeId) {
      setEditingRecipe(null);
    }
  }

  // Function to edit a recipe by its ID
  const editRecipe = (recipeId) => {
    const recipeToEdit = recipes.find((recipe) => recipe.id === recipeId);
    setEditingRecipe(recipeToEdit);
  };

  useEffect(() => {
    localStorage.setItem("recipes", JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (tagFilter === "All") {
      params.delete("tag");
    } else {
      params.set("tag", tagFilter);
    }

    const queryString = params.toString();

    const newUrl = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState({}, "", newUrl);
  }, [tagFilter]);  

  useEffect(() => {
    if (
      tagFilter !== "All" &&
      !tags.some((tag) => tag === tagFilter)
    ) {
      setTagFilter("All");
    }
  }, [tags]);

  useEffect(() => {
    localStorage.setItem("tags", JSON.stringify(tags));
  }, [tags])

  useEffect(() => {
    localStorage.setItem("planner", JSON.stringify(planner));
  }, [planner]);

  return (
    <div>
      <Header averagePreparationTime={averagePreparationTime} />

      <main className="container">
        <div className="view-switcher">
            <button
                type="button"
                className={activeView === "recipes" ? "active" : ""}
                onClick={() => setActiveView("recipes")}
            >
                My Recipe Box
            </button>

            <button
                type="button"
                className={activeView === "meals" ? "active" : ""}
                onClick={() => setActiveView("meals")}
            >
                Discover Meals
            </button>
        </div>

        {activeView === "recipes" ? (
            <>
                <div className="dashboard-layout">

                    <aside className="dashboard-sidebar">
                        <Stats
                        totalRecipes={recipes.length}
                        averagePreparationTime={overallAveragePreparationTime}
                        mostUsedTag={mostUsedTag}
                        plannerFill={plannerFill}
                        />
                    </aside>

                    <AddRecipeForm
                        setRecipes={setRecipes}
                        editingRecipe={editingRecipe}
                        setEditingRecipe={setEditingRecipe}
                        tags={tags}
                        setTags={setTags}
                        renameTag={renameTag}
                        deleteTag={deleteTag}
                    />

                    <Planner
                        recipes={recipes}
                        planner={planner}
                        setPlanner={setPlanner}
                    />

                </div>

                <SearchFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    tagFilter={tagFilter}
                    setTagFilter={setTagFilter}
                    tags={tags}
                />

                <RecipeList
                    recipes={filteredRecipes}
                    totalRecipes={recipes.length}
                    onDeleteRecipe={deleteRecipe}
                    onEditRecipe={editRecipe}
                />
            </>
        ) : (
            <MealDiscovery />
        )}       
      </main>
    </div>
  )
}

export default App