import { describe, it, expect, vi, afterEach } from "vitest";
import {
    render,
    screen,
    waitFor,
    fireEvent,
    act,
} from "@testing-library/react";

import MealDiscovery from "../components/MealDiscovery.jsx";
import * as mealDb from "../services/mealDb.js";

vi.mock("../services/mealDb.js");

afterEach(() => {
    vi.clearAllMocks();
});

describe("MealDiscovery search", () => {
    it("shows an empty state when search returns no meals", async () => {
        mealDb.searchMealsByName.mockResolvedValue([]);
        mealDb.getCategories.mockResolvedValue([]);

        render(
            <MealDiscovery
                setRecipes={vi.fn()}
                setTags={vi.fn()}
            />
        );

        const searchInput = screen.getByLabelText(
            "Search meals by name:"
        );

        fireEvent.change(searchInput, {
            target: { value: "xyzabc123" }
        });

        await waitFor(() => {
            expect(
                screen.getByText(/No meals found for "xyzabc123"/)
            ).toBeInTheDocument();
        });
    });

    it("does not show stale results from an older search", async () => {
        let resolveChicken;
        let resolveBeef;

        mealDb.getCategories.mockResolvedValue([]);

        mealDb.searchMealsByName
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveChicken = resolve;
                    })
            )
            .mockImplementationOnce(
                () =>
                    new Promise((resolve) => {
                        resolveBeef = resolve;
                    })
            );

        render(
            <MealDiscovery
                setRecipes={vi.fn()}
                setTags={vi.fn()}
            />
        );

        const searchInput = screen.getByLabelText(
            "Search meals by name:"
        );

        fireEvent.change(searchInput, {
            target: { value: "chicken" }
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 350));
        });

        fireEvent.change(searchInput, {
            target: { value: "beef" }
        });

        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 350));
        });

        resolveBeef([
            {
                idMeal: "2",
                strMeal: "Beef Curry",
                strCategory: "Beef",
                strArea: "Indian"
            }
        ]);

        await waitFor(() => {
            expect(
                screen.getByText("Beef Curry")
            ).toBeInTheDocument();
        });

        resolveChicken([
            {
                idMeal: "1",
                strMeal: "Chicken Curry",
                strCategory: "Chicken",
                strArea: "Indian"
            }
        ]);

        await waitFor(() => {
            expect(
                screen.getByText("Beef Curry")
            ).toBeInTheDocument();

            expect(
                screen.queryByText("Chicken Curry")
            ).not.toBeInTheDocument();
        });
    });

    it("imports a MealDB meal into the local recipe box", async () => {
        const setRecipes = vi.fn();
        const setTags = vi.fn();

        mealDb.getCategories.mockResolvedValue([]);
        
        mealDb.searchMealsByName.mockResolvedValue([
            {
                idMeal: "123",
                strMeal: "Chicken Curry",
                strCategory: "Chicken",
                strArea: "Indian",
            }
        ]);

        mealDb.getMealById.mockResolvedValue({
            idMeal: "123",
            strMeal: "Chicken Curry",
            strIngredient1: "Chicken",
            strMeasure1: "500g",
            strIngredient2: "Salt",
            strMeasure2: "1 tsp"
        });

        render(
            <MealDiscovery
                setRecipes={setRecipes}
                setTags={setTags}
            />
        );

        const searchInput = screen.getByLabelText(
            "Search meals by name:"
        );

        fireEvent.change(searchInput, {
            target: { value: "chicken" }
        });

        await waitFor(() => {
            expect(
                screen.getByText("Chicken Curry")
            ).toBeInTheDocument();
        })

        fireEvent.click(
            screen.getByText("Chicken Curry")
        );

        await waitFor(() => {
            expect(
                screen.getByRole("button", {
                    name: "Import to my box"
                })
            ).toBeInTheDocument();
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Import to my box"
            })
        );

        const updateRecipes = setRecipes.mock.calls[0][0];

        const updatedRecipes = updateRecipes([]);

        expect(updatedRecipes).toHaveLength(1);
        expect(updatedRecipes[0]).toMatchObject({
            title: "Chicken Curry",
            ingredients: [
                "500g Chicken",
                "1 tsp Salt"
            ],
            prepTime: 30,
            servings: 1,
            tags: ["imported"]
        });

        expect(setTags).toHaveBeenCalledWith(
            expect.any(Function)
        );
    })

    it("ignores an older response during the debounce window", async () => {
        vi.useFakeTimers();

        let resolveChicken;

        mealDb.getCategories.mockResolvedValue([]);

        mealDb.searchMealsByName.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveChicken = resolve;
                })
        );

        render(
            <MealDiscovery
                setRecipes={vi.fn()}
                setTags={vi.fn()}
            />
        );

        const searchInput = screen.getByLabelText(
            "Search meals by name:"
        );

        fireEvent.change(searchInput, {
            target: { value: "chicken" }
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        fireEvent.change(searchInput, {
            target: { value: "beef" }
        });

        resolveChicken([
            {
                idMeal: "1",
                strMeal: "Chicken Curry",
                strCategory: "Chicken",
                strArea: "Indian"
            }
        ]);

        await act(async () => {
            await Promise.resolve();
        });

        expect(
            screen.queryByText("Chicken Curry")
        ).not.toBeInTheDocument();

        vi.useRealTimers();
    });    
});