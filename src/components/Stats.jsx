import React from "react";

const Stats = ({
  totalRecipes,
  averagePreparationTime,
  mostUsedTag,
  plannerFill,
}) => {
  return (
    <section className="stats">
      <h2>Recipe Stats</h2>

      <div className="stats-grid">
        <div className="stat">
          <h3>Total Recipes</h3>
          <p>{totalRecipes}</p>
        </div>

        <div className="stat">
          <h3>Average Prep Time</h3>
          <p>{averagePreparationTime} min</p>
        </div>

        <div className="stat">
          <h3>Most Used Tag</h3>
          <p>
            {mostUsedTag ? mostUsedTag.tag : "No tags"}
          </p>
        </div>

        <div className="stat">
          <h3>Planner Fill</h3>
          <p>{plannerFill} / 7 days</p>
        </div>
      </div>
    </section>
  );
};

export default Stats;