import React from "react";

const IngredientInput = ({ value, onChange, onRemove }) => {
  return (
    <div className="ingredient-row">
      <input
        type="text"
        placeholder="Enter ingredient"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button type="button" className="remove-btn" onClick={onRemove}>
        Remove
      </button>
    </div>
  );
};

export default IngredientInput;
