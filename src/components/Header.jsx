import React from 'react'

const Header = ({ averagePreparationTime }) => {
  return (
    <header className="header">
      <h1>Recipe Box</h1>
      <p>Save your favourite recipes</p>

      <div className="header-stats">
        <span>Avg. Prep Time: {averagePreparationTime} mins (Filtered)</span>
      </div>
    </header>
  )
}

export default Header