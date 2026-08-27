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
});