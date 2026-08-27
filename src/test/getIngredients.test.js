import { describe, it, expect } from "vitest";
import { getIngredients } from "../utils/getIngredients.js";

describe("getIngredients", () => {
    it("merges ingredients and measures and skips empty ingredients", () => {
        const meal = {
            strIngredient1: " Chicken ",
            strMeasure1: " 500g ",

            strIngredient2: "Salt",
            strMeasure2: "1 tsp",

            strIngredient3: "",
            strMeasure3: "",

            strIngredient4: null,
            strMeasure4: "2 tbsp",

            strIngredient5: "Pepper",
            strMeasure5: " ",
        };

        const result = getIngredients(meal);

        expect(result).toEqual([
            {
                ingredient: "Chicken",
                measure: "500g",
            },
            {
                ingredient: "Salt",
                measure: "1 tsp",
            },
            {
                ingredient: "Pepper",
                measure: "",
            },
        ]);
    });
});