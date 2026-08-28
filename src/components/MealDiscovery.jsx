import React, {useEffect, useState, useRef } from 'react'
import { searchMealsByName, getCategories, getMealsByCategory, getMealById } from "../services/mealDb.js";
import { getIngredients } from "../utils/getIngredients.js";

const MealDiscovery = ({ setRecipes, setTags }) => {
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mealSearch") || "";
  });
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  
  const [retryCount, setRetryCount] = useState(0);

  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryRetryCount, setCategoryRetryCount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("mealCategory") || "";
  });

  const [categoryMeals, setCategoryMeals] = useState([]);
  const [categoryMealsLoading, setCategoryMealsLoading] = useState(false);
  const [categoryMealsError, setCategoryMealsError] = useState(null);
  const [categoryMealsRetryCount, setCategoryMealsRetryCount] = useState(0);

  const [selectedMealId, setSelectedMealId] = useState("");
  const [mealDetails, setMealDetails] = useState(null);
  const [mealDetailsLoading, setMealDetailsLoading] = useState(false);
  const [mealDetailsError, setMealDetailsError] = useState(null);
  const [mealDetailsRetryCount, setMealDetailsRetryCount] = useState(0);

  const [importedMealId, setImportedMealId] = useState("");

  const [searchPage, setSearchPage] = useState(1);
  const [categoryPage, setCategoryPage] = useState(1);

  const MEALS_PER_PAGE = 6;

  const activeSearchId = useRef(0);

  // Fetch meals based on search term
  const searchMeals = async (term, signal) => {
    const requestId = ++activeSearchId.current;

    if (!term.trim()) {
        setMeals([]);
        setError(null);
        setLoading(false);
        return;
    }

    setLoading(true);
    setError(null);

    try {
        const results = await searchMealsByName(term, signal);

        if (requestId !== activeSearchId.current) {
            return;
        }

        setMeals(results);
    } catch (error) {
        if(error.name === "AbortError"){
            return;
        } 

        if (requestId !== activeSearchId.current) {
            return;
        }

        setError(error.message);
        setMeals([]);
    } finally {
        if (!signal?.aborted && requestId === activeSearchId.current) {
            setLoading(false);
        }
    }
  };

  // Fetch categories
  const fetchCategories = async (signal) => {
    setCategoryLoading(true);
    setCategoryError(null);

    try {
        const results = await getCategories(signal);
        setCategories(results);
    } catch (error) {
        if(error.name === "AbortError"){
            return;
        }

        setCategoryError(error.message);
        setCategories([]);
    } finally {
        if (!signal?.aborted) {
            setCategoryLoading(false);
        }
    }
  }

  // Fetch meals based on selected category
  const fetchCategoryMeals = async (category, signal) => {
    if (!category.trim()) {
        setCategoryMeals([]);
        setCategoryMealsError(null);
        setCategoryMealsLoading(false);
        return;
    }

    setCategoryMealsLoading(true);
    setCategoryMealsError(null);

    try {
        const results = await getMealsByCategory(category, signal);
        setCategoryMeals(results);
    } catch (error) {
        if(error.name === "AbortError"){
            return;
        }

        setCategoryMealsError(error.message);
        setCategoryMeals([]);
    } finally {
        if (!signal?.aborted) {
            setCategoryMealsLoading(false);
        }
    }
  }

  // Fetch meal details based on selected meal ID
  const fetchMealDetails = async (mealId, signal) => {
    if (!mealId.trim()) {
        setMealDetails(null);
        setMealDetailsError(null);
        setMealDetailsLoading(false);
        return;
    }

    setMealDetailsLoading(true);
    setMealDetailsError(null);

    try {
        const result = await getMealById(mealId, signal);
        setMealDetails(result);
    } catch (error) {
        if(error.name === "AbortError"){
            return;
        }

        setMealDetailsError(error.message);
        setMealDetails(null);
    } finally {
        if (!signal?.aborted) {
            setMealDetailsLoading(false);
        }
    }
  }

  // Function to handle importing a meal
  const handleImport = () => {
    if (!mealDetails) {
        return;
    }

    const ingredients = getIngredients(mealDetails).map(
        (item) => `${item.measure} ${item.ingredient}`.trim()
    );

    const importedRecipe = {
        id: Date.now() + Math.random(),
        title: mealDetails.strMeal.trim(),
        ingredients,
        prepTime: 0,
        servings: 1,
        tags: ["imported"],
    };

    setRecipes((prevRecipes) => [
        ...prevRecipes,
        importedRecipe,
    ]);

    setTags((prevTags) => {
        if (prevTags.includes("imported")) {
            return prevTags;
        }

        return [...prevTags, "imported"];
    });

    setImportedMealId(mealDetails.idMeal);
  };


  const searchStartIndex = (searchPage - 1) * MEALS_PER_PAGE;
  const searchEndIndex = searchStartIndex + MEALS_PER_PAGE;

  const visibleSearchMeals = meals.slice(searchStartIndex, searchEndIndex);

  const searchTotalPages = Math.ceil(meals.length / MEALS_PER_PAGE);


  const categoryStartIndex = (categoryPage - 1) * MEALS_PER_PAGE;

  const visibleCategoryMeals = categoryMeals.slice(
    categoryStartIndex,
    categoryStartIndex + MEALS_PER_PAGE
  );

  const categoryTotalPages = Math.ceil(
    categoryMeals.length / MEALS_PER_PAGE
  );


   // useEffect to handle meal search with debounce
    useEffect(() => {
        const controller = new AbortController();

        const timer = setTimeout(() => {
            searchMeals(searchTerm, controller.signal);
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchTerm, retryCount]);

    // Reset search page when search term changes
    useEffect(() => {
        setSearchPage(1);
    }, [searchTerm]);

    // useEffect to fetch categories
    useEffect(() => {
        const controller = new AbortController();

        fetchCategories(controller.signal);

        return () => {
            controller.abort();
        };
    }, [categoryRetryCount])

    // useEffect to fetch meals based on selected category
    useEffect(() => {
        const controller = new AbortController();

        fetchCategoryMeals(selectedCategory, controller.signal);

        return () => {
            controller.abort();
        };
    }, [selectedCategory, categoryMealsRetryCount]);

    // Reset category page when selected category changes
    useEffect(() => {
        setCategoryPage(1);
    }, [selectedCategory]);

    // useEffect to fetch meal details based on selected meal ID
    useEffect(() => {
        const controller = new AbortController();

        fetchMealDetails(selectedMealId, controller.signal);

        return () => {
            controller.abort();
        }
    }, [selectedMealId, mealDetailsRetryCount]);

    // useEffect to update URL query parameters based on search term
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (searchTerm.trim() === "") {
            params.delete("mealSearch");
        } else {
            params.set("mealSearch", searchTerm);
        }

        const queryString = params.toString();

        const newUrl = queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

        window.history.replaceState({}, "", newUrl);
    }, [searchTerm]);

    // useEffect to update URL query parameters based on selected category
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        if (selectedCategory.trim() === "") {
            params.delete("mealCategory");
        } else {
            params.set("mealCategory", selectedCategory);
        }

        const queryString = params.toString();

        const newUrl = queryString
            ? `${window.location.pathname}?${queryString}`
            : window.location.pathname;

        window.history.replaceState({}, "", newUrl);
    }, [selectedCategory]);

  const handleRetry = () => {
    setRetryCount((count) => count + 1)
  }

  return (
    <section className='meal-discovery'>
        <h2>Meal Discovery</h2>

        <div className='meal-search'>
            <label htmlFor="meal-search">Search meals by name:</label>

            <input 
                id="meal-search"
                type='text'
                placeholder='e.g. Chicken Curry'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {loading && (
            <div className="meal-state">
                <p>Searching meals...</p>
            </div>
        )}

        {!loading && error && (
            <div className="meal-state meal-error">
                <p>Unable to load meals. Please try again.</p>

                <button type="button" onClick={handleRetry}>
                    Retry
                </button>
            </div>
        )}

        {!loading && !error && searchTerm.trim() && meals.length === 0 && (
            <div className="meal-state meal-empty">
                <p>
                    No meals found for "{searchTerm.trim()}". Try another meal name.
                </p>
            </div>
        )}

        {!loading && !error && meals.length > 0 && (
            <>
                <div className='meal-results'>
                    {visibleSearchMeals.map((meal) => (
                        <article 
                            className='meal-card' 
                            key={meal.idMeal}
                            onClick={() => setSelectedMealId(meal.idMeal)}
                        >
                            <h3>{meal.strMeal}</h3>
                            <p>{meal.strCategory}</p>
                            <p>{meal.strArea}</p>
                        </article>
                    ))}
                </div>

                {searchTotalPages > 1 && (
                    <div className="meal-pagination">
                        <button
                            type="button"
                            disabled={searchPage === 1}
                            onClick={() => setSearchPage((page) => page - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {searchPage} of {searchTotalPages}
                        </span>

                        <button
                            type="button"
                            disabled={searchPage === searchTotalPages}
                            onClick={() => setSearchPage((page) => page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </>                
        )}

        {!loading && !error && !searchTerm.trim() && (
            <div className="meal-state">
                <p>Search for a meal to get started.</p>
            </div>
        )}




        {categoryLoading && (
            <div className="meal-state">
                <p>Loading categories...</p>
            </div>
        )}

        {!categoryLoading && categoryError && (
            <div className="meal-state meal-error">
                <p>Unable to load categories. Please try again.</p>
                <button 
                    type="button" 
                    onClick={() => setCategoryRetryCount((count) => count + 1)}
                >
                    Retry
                </button>
            </div>
        )}

        {!categoryLoading && !categoryError && categories.length === 0 && (
            <div className="meal-state meal-empty">
                <p>No categories found.</p>
            </div>
        )}

        {!categoryLoading && !categoryError && categories.length > 0 && (
            <div className="meal-categories">
                <h3>Browse by Category</h3>

                <div className="category-list">
                {categories.map((category) => (
                    <button
                        type="button"
                        key={category.idCategory}
                        className={selectedCategory === category.strCategory ? "selected-category" : ""}
                        onClick={() => setSelectedCategory(category.strCategory)}
                    >
                        {category.strCategory}
                    </button>
                ))}
                </div>
            </div>
        )}
        
        {categoryMealsLoading && (
            <div className="meal-state">
                <p>Loading meals for category "{selectedCategory}"...</p>
            </div>
        )}

        {!categoryMealsLoading && categoryMealsError && (
            <div className="meal-state meal-error">
                <p>Unable to load meals for category "{selectedCategory}". Please try again.</p>
                <button
                    type="button"
                    onClick={() => setCategoryMealsRetryCount((count) => count + 1)}
                >
                    Retry
                </button>
            </div>
        )}

        {!categoryMealsLoading && !categoryMealsError && selectedCategory && categoryMeals.length === 0 && (
            <div className="meal-state meal-empty">
                <p>No meals found for category "{selectedCategory}".</p>
            </div>
        )}

        {!categoryMealsLoading && !categoryMealsError && selectedCategory && categoryMeals.length > 0 && (
            <>
                <div className="category-meals">
                    <h3>Meals in "{selectedCategory}" Category</h3>
                    <div className="meal-results">
                        {visibleCategoryMeals.map((meal) => (
                            <article 
                                className="meal-card" 
                                key={meal.idMeal}
                                onClick={() => setSelectedMealId(meal.idMeal)}
                            >
                                <h3>{meal.strMeal}</h3>
                            </article>
                        ))}
                    </div>
                </div>
                {categoryTotalPages > 1 && (
                    <div className="meal-pagination">
                        <button
                            type="button"
                            disabled={categoryPage === 1}
                            onClick={() => setCategoryPage((page) => page - 1)}
                        >
                            Previous
                        </button>

                        <span>
                            Page {categoryPage} of {categoryTotalPages}
                        </span>

                        <button
                            type="button"
                            disabled={categoryPage === categoryTotalPages}
                            onClick={() => setCategoryPage((page) => page + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}                
            </>    
        )}

        {mealDetailsLoading && selectedMealId && (
            <div className="meal-details-overlay">
                <div className="meal-details-modal">
                    <p>Loading meal details...</p>
                </div>
            </div>
        )}

        {!mealDetailsLoading && mealDetailsError && selectedMealId && (
            <div className="meal-details-overlay">
                <div className="meal-details-modal meal-error">
                    <button
                        type="button"
                        className="meal-details-close"
                        onClick={() => setSelectedMealId("")}
                    >
                        ×
                    </button>

                    <p>Unable to load meal details. Please try again.</p>

                    <button
                        type="button"
                        onClick={() =>
                            setMealDetailsRetryCount((count) => count + 1)
                        }
                    >
                        Retry
                    </button>
                </div>
            </div>
        )}

        {!mealDetailsLoading && !mealDetailsError && !mealDetails && selectedMealId && (
            <div className="meal-details-overlay">
                <div className="meal-details-modal meal-empty">

                    <button
                        type="button"
                        className="meal-details-close"
                        onClick={() => setSelectedMealId("")}
                    >
                        ×
                    </button>

                    <p>
                        Meal details not found. Please try another meal.
                    </p>

                </div>
            </div>
        )}        

        {!mealDetailsLoading && !mealDetailsError && mealDetails && (
            <div className="meal-details-overlay">
                <div className="meal-details-modal">

                    <button
                        type="button"
                        className="meal-details-close"
                        onClick={() => setSelectedMealId("")}
                    >
                        ×
                    </button>

                    <h3>{mealDetails.strMeal}</h3>
                    <button
                        type="button"
                        className="import-meal-btn"
                        onClick={handleImport}
                    >
                        Import to my box
                    </button>

                    {importedMealId === mealDetails.idMeal && (
                        <p className="import-success">
                            Recipe imported successfully!
                        </p>
                    )}

                    {mealDetails.strMealThumb && (
                        <img
                            className="meal-details-image"
                            src={mealDetails.strMealThumb}
                            alt={mealDetails.strMeal}
                        />
                    )}

                    <p>
                        <strong>Category:</strong> {mealDetails.strCategory}
                    </p>

                    <p>
                        <strong>Area:</strong> {mealDetails.strArea}
                    </p>

                    <h4>Ingredients</h4>

                    <ul className="meal-ingredients">
                        {getIngredients(mealDetails).map((item) => (
                            <li key={item.ingredient}>
                                <span>{item.ingredient}</span>
                                <span>{item.measure}</span>
                            </li>
                        ))}
                    </ul>

                    <h4>Instructions</h4>

                    <p className="meal-instructions">
                        {mealDetails.strInstructions}
                    </p>

                    <div className="meal-details-links">
                        {mealDetails.strYoutube && (
                            <a
                                href={mealDetails.strYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Watch on YouTube
                            </a>
                        )}

                        {mealDetails.strSource && (
                            <a
                                href={mealDetails.strSource}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Original Recipe
                            </a>
                        )}
                    </div>

                </div>
            </div>
        )}
    </section>
  )
}

export default MealDiscovery