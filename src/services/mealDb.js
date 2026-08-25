const MEAL_DB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export const searchMealsByName = async (searchTerm, signal) => {
    const query = encodeURIComponent(searchTerm.trim());

    const response = await fetch(
        `${MEAL_DB_BASE_URL}/search.php?s=${query}`, {
            signal: signal
        }
    )

    if(!response.ok) {
        throw new Error("Failed to fetch meals");
    }

    const data = await response.json();
    if(data.meals === null || data.meals === undefined) {
        return [];
    }

    return data.meals;
}