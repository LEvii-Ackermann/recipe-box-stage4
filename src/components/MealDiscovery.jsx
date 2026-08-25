import React, {useEffect, useState} from 'react'
import { searchMealsByName } from "../services/mealDb.js";

const MealDiscovery = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);  
  const [retryCount, setRetryCount] = useState(0);

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
    </section>
  )
}

export default MealDiscovery