export const getIngredients = (meal) => {
    const ingredients = [];

    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`]?.trim();
        const measure = meal[`strMeasure${i}`]?.trim() || '';

        if (ingredient) {
            ingredients.push({
                ingredient,
                measure
            });
        }
    }

    return ingredients;
};