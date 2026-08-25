import { useState, useEffect } from "react";
import IngredientInput from "./IngredientInput.jsx";

const AddRecipeForm = ({ setRecipes, editingRecipe, setEditingRecipe, tags, setTags, renameTag, deleteTag }) => {
  const [recipe, setRecipe] = useState({
    title: "",
    prepTime: "",
    servings: "",
    tags: [],
    ingredients: [""],
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    title: false,
    prepTime: false,
    servings: false,
    ingredients: false,
  })
  const [newTag, setNewTag] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [tagError, setTagError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedRecipe = {
      ...recipe,
      [name]: value,
    };
    setRecipe(updatedRecipe);

    setTouched((prevTouched) => ({
      ...prevTouched,
      [name]: true,
    }));

    validateForm(updatedRecipe);
  };

  // Function to add a new ingredient input
  const addIngredient = () => {
    const updatedRecipe = {
      ...recipe,
      ingredients: [...recipe.ingredients, ""],
    };
    setRecipe(updatedRecipe);
  };

  // Function to handle changes in individual ingredient inputs
  const handleIngredientChange = (index, value) => {
    const updatedIngredients = [...recipe.ingredients];

    updatedIngredients[index] = value;

    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
    };

    setRecipe(updatedRecipe);

    setTouched((prevTouched) => ({
      ...prevTouched,
      ingredients: true,
    }));

    validateForm(updatedRecipe);
  };

  // Function to remove an ingredient input
  const removeIngredient = (index) => {
    if (recipe.ingredients.length === 1) {
      return;
    }

    const updatedIngredients = recipe.ingredients.filter((ingredient, i) => {
      return i !== index;
    });

    const updatedRecipe = {
      ...recipe,
      ingredients: updatedIngredients,
    };
    setRecipe(updatedRecipe);

    setTouched((prevTouched) => ({
      ...prevTouched,
      ingredients: true,
    }));

    validateForm(updatedRecipe);
  };

  // Function to validate the form inputs
  const validateForm = (recipeData = recipe) => {
    const newErrors = {};

    if(!recipeData.title.trim()) {
        newErrors.title = "Title is required";
    }

    if(!recipeData.prepTime || Number(recipeData.prepTime) <= 0) {
        newErrors.prepTime = "Preparation time must be a positive number";
    }

    if(!recipeData.servings || Number(recipeData.servings) <= 0) {
        newErrors.servings = "Servings must be a positive number";
    }

    const hasIngredient = recipeData.ingredients.some(
        (ingredient) => ingredient.trim() !== ""
    )
    if(!hasIngredient) {
        newErrors.ingredients = "At least one ingredient is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  // function to create a new tag
  const createTag = () => {
    const tag = newTag.trim();

    if(!tag) {
      setTagError("Tag name cannot be empty");
      return;
    }

    const tagExists = tags.some(
      (existingTag) => (
        existingTag.toLowerCase() === tag.toLowerCase()
      )
    )

    if(tagExists) {
      setTagError("This tag already exists");
      return;
    }

    setTags((prevTags) => [...prevTags, tag]);

    setRecipe((prevRecipe) => ({
      ...prevRecipe,
      tags: [...prevRecipe.tags, tag]
    }))

    setNewTag("");
    setTagError("");
  }

  // function to toggle tag
  const toggleTag = (tag) => {
    setRecipe((prevRecipe) => {
      const hasTag = prevRecipe.tags.includes(tag);

      return {
        ...prevRecipe,
        tags: hasTag 
          ? prevRecipe.tags.filter((item) => item !== tag)
          : [...prevRecipe.tags, tag]
      }
    })
  }

  const handleRenameTag = () => {
    const updatedTag = newTag.trim();

    if (!editingTag || !updatedTag) {
      setTagError("Tag name cannot be empty");
      return;
    }

    if (editingTag.toLowerCase() === updatedTag.toLowerCase()) {
      setTagError("Please enter a different tag name");
      return;
    }

    const renamed = renameTag(editingTag, updatedTag);

    if (!renamed) {
      setTagError("This tag already exists");
      return;
    }

    setEditingTag(null);
    setNewTag("");
    setTagError("")
  };

  // Function to handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    setTouched({
        title: true,
        prepTime: true,
        servings: true,
        ingredients: true,
    })

    if (!validateForm()) {
        return;
    }

    // Clean up ingredients by removing empty strings
    const cleanedIngredients = recipe.ingredients
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient !== "")
    
      const recipeData = {
      ...recipe,
      title: recipe.title.trim(),
      prepTime: Number(recipe.prepTime),
      servings: Number(recipe.servings),
      ingredients: cleanedIngredients,
    };

    if (editingRecipe) {
      // Update the existing recipe
      setRecipes((prevRecipes) => {
        return prevRecipes.map((item) => {
          if (item.id === editingRecipe.id) {
            return {
              ...recipeData,
              id: editingRecipe.id,
            };
          }
          else {
            return item;
          }
        })
      })

      setEditingRecipe(null);
    }
    else {
      // Add a new recipe
      const newRecipe = {
        ...recipeData,
        id: Date.now(),
      }

      setRecipes((prevRecipes) => [
          ...prevRecipes,
          newRecipe,
      ])
    }
    

    setRecipe({
        title: "",
        prepTime: "",
        servings: "",
        tags: [],
        ingredients: [""],
    });
    setErrors({});
    setTouched({
        title: false,
        prepTime: false,
        servings: false,
        ingredients: false,
    })

  };

  useEffect(() => {
    if (editingRecipe) {
      setRecipe(editingRecipe);
      setErrors({});                              // Clear errors when editing a recipe
      setTouched({
        title: false,
        prepTime: false,
        servings: false,
        ingredients: false,
      });
    }
    else {
      setRecipe({
        title: "",
        prepTime: "",
        servings: "",
        tags: [],
        ingredients: [""],
      });

      setErrors({});
      setTouched({
        title: false,
        prepTime: false,
        servings: false,
        ingredients: false,
      });
    }
  }, [editingRecipe]);

  return (
    <section className="form-container">
      <h2>{editingRecipe ? "Edit Recipe" : "Add Recipe"}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Recipe Title:</label>
          <input
            type="text"
            id="title"
            placeholder="Enter recipe title"
            name="title"
            value={recipe.title}
            onChange={handleChange}
          />
          { touched.title && errors.title && <p className="error">{errors.title}</p>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prepTime">Preparation Time: (minutes)</label>
            <input
              type="number"
              id="prepTime"
              placeholder="e.g. 30"
              name="prepTime"
              value={recipe.prepTime}
              onChange={handleChange}
            />
            { touched.prepTime && errors.prepTime && <p className="error">{errors.prepTime}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="servings">Servings:</label>
            <input
              type="number"
              id="servings"
              placeholder="e.g. 4"
              name="servings"
              value={recipe.servings}
              onChange={handleChange}
            />
            { touched.servings && errors.servings && <p className="error">{errors.servings}</p> }
          </div>
        </div>

        <div className="form-group">
          <label>Tags</label>

          <div className="tag-list">
            {tags.map((tag) => (
              <div className="tag-item" key={tag}>
                <button
                  type="button"
                  className={`tag-select-btn ${
                    recipe.tags.includes(tag) ? "selected-tag" : ""
                  }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>

                <button
                  type="button"
                  className="tag-action-btn"
                  onClick={() => {
                    setEditingTag(tag);
                    setNewTag(tag.trim());
                  }}
                >
                  Rename
                </button>

                <button
                  type="button"
                  className="tag-delete-btn"
                  onClick={() => deleteTag(tag)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="tag-create-row">
            <div className="tag-input-group">
              <input
                type="text"
                placeholder={editingTag ? "Rename tag" : "Create new tag"}
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
              {tagError && <p className="error">{tagError}</p>}
            </div>
            
            <button
              type="button"
              className="add-btn"
              onClick={editingTag ? handleRenameTag : createTag}
            >
              {editingTag ? "Rename Tag" : "Add Tag"}
            </button>

            {editingTag && (
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setEditingTag(null);
                  setNewTag("");
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="ingredients-section">
          <div className="form-group">
            <label>Ingredients:</label>

            {recipe.ingredients.map((ingredient, index) => (
              <IngredientInput
                key={index}
                value={ingredient}
                onChange={(value) => handleIngredientChange(index, value)}
                onRemove={() => removeIngredient(index)}
              />
            ))}
            { touched.ingredients && errors.ingredients && <p className="error">{errors.ingredients}</p> } 
          </div>    

          <button type="button" className="add-btn" onClick={addIngredient}>
            Add Ingredient
          </button>
        </div>

        <div className="form-actions">
            <button type="submit" className="submit-btn">
                {editingRecipe ? "Save Changes" : "Add Recipe"}
            </button>

            {editingRecipe && (
              <button type="button" className="cancel-btn" onClick={() => setEditingRecipe(null)}>
                Cancel
              </button>
            )}
        </div>    
      </form>
    </section>
  );
};

export default AddRecipeForm;
