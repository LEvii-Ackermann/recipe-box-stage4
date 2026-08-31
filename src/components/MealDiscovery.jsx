1. Race condition in debounced meal search: In `searchMeals`, the latest-request guard (checking `requestId !== activeSearchId.current`) is not present in the success path before calling `setMeals(results)`, so an old response can overwrite a new result.

Answer = If, we do not have `requestId !== activeSearchId.current` in the success path before calling `setMeals(results)`, then the problem will be Old response can overwrite a new result.

So, we have to add this condition, Why we need this ?
Whenever, the user changes his search query for every `request`, we give it a different `activeSearchId` like for every request we are incrementing the `activeSearchId.current`.

CODE:
try {
    const results = await searchMealByName(searchTerm, signal)
    if (requestId !== activeSearchId.current) {
        return
    }
    setMeals(results)
}

Now, if any request Id is different from `activeSearchId`, we are not allowing it to overwrite our new result. Because we have a condition there before `setMeals(results)`, if the condition will be `true`, it will return from there and `setMeals(results)` will not run.



2. Search pagination off-by-one: `const searchStartIndex = searchPage * MEALS_PER_PAGE;` means page 1 starts at index 6 instead of 0, so the first page skips the first 6 meals.

Answer = So, the bug here is Search pagination off-by-one because we have `const searchStartIndex = searchPage * MEALS_PER_PAGE;`

So, what is happening here. If, our MEALS_PER_PAGE=6
THEN for page 1, searchStartIndex = 1 * 6 = 6
     for page 2, searchStartIndex = 2 * 6 = 12
and so on.

But we want to start from index 0 for page 1 and index 6 for page 2 and so on
To solve this we can simply replace `const searchStartIndex = searchPage * MEALS_PER_PAGE;`
with `const searchStartIndex = (searchPage - 1) * MEALS_PER_PAGE;`

Now, for page1 because `searchPage=1` then, `searchStartIndex= (1-1)*6` which is equal to 0
Same, for page2, `searchStartIndex = (2-1)*6` which is equal to 6

So, the first page will show first Six meals, From index 0 to 5 and the next page will show the next six and so on.

Now, our app will not skip the first Six meals.



3. Category meals do not refetch on category change: The `useEffect` calling `fetchCategoryMeals` does not have `selectedCategory` in the dependency array, so changing the category does not load new meals until another dependency (like retry count) changes.

Answer = If the `useEffect` calling `fetchCategoryMeals` does not have `selectedCategory` in the dependency array.
THEN, new category meals will not fetch on category change.

To solve this, We just have to add `selectedCategory` in the dependency array of the `useEffect` which is calling `fetchCategoryMeals`

CODE:
useEffect(() => {
    const controller = new AbortController();

    fetchCategoryMeals(selectedCategory, controller.signal);

    return () => controller.abort();

}, [selectedCategory, selectedCategoryRetryCount])


So, now whenever user change the category, `selectedCategory` state will also change and Now, because we have `selectedCategory` in the dependency array of this useEffect, this will run again and call the `fetchCategoryMeals`
function again.
When, this `fetchCategoryMeals` function will run, the `categoryMeals` state will update again.
And the user can see the updated category meals.

