import React, {useEffect, useState} from 'react'
import { searchMealsByName, getCategories, getMealsByCategory } from "../services/mealDb.js";

const MealDiscovery = () => {
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

  const [selectedCategory, setSelectedCategory] = useState("");

  const [categoryMeals, setCategoryMeals] = useState([]);
  const [categoryMealsLoading, setCategoryMealsLoading] = useState(false);
  const [categoryMealsError, setCategoryMealsError] = useState(null);
  const [categoryMealsRetryCount, setCategoryMealsRetryCount] = useState(0);

  const searchMeals = async (term, signal) => {
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
        setMeals(results);
    } catch (error) {
        if(error.name === "AbortError"){
            return;
        } 

        setError(error.message);
        setMeals([]);
    } finally {
        if (!signal?.aborted) {
            setLoading(false);
        }
    }
  };

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

    useEffect(() => {
        const controller = new AbortController();

        fetchCategories(controller.signal);

        return () => {
            controller.abort();
        };
    }, [categoryRetryCount])

    useEffect(() => {
        const controller = new AbortController();

        fetchCategoryMeals(selectedCategory, controller.signal);

        return () => {
            controller.abort();
        };
    }, [selectedCategory, categoryMealsRetryCount]);

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
            <div className='meal-results'>
                {meals.map((meal) => (
                    <article className='meal-card' key={meal.idMeal}>
                        <h3>{meal.strMeal}</h3>
                        <p>{meal.strCategory}</p>
                        <p>{meal.strArea}</p>
                    </article>
                ))}
            </div>
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
            <div className="category-meals">
                <h3>Meals in "{selectedCategory}" Category</h3>
                <div className="meal-results">
                    {categoryMeals.map((meal) => (
                        <article className="meal-card" key={meal.idMeal}>
                            <h3>{meal.strMeal}</h3>
                        </article>
                    ))}
                </div>
            </div>
        )}
    </section>
  )
}

export default MealDiscovery