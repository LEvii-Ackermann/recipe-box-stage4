import React from 'react'

const SearchFilter = ({ searchTerm, setSearchTerm, tagFilter, setTagFilter, tags }) => {
  return (
    <section className="search-section">
        <div className="form-group">
            <label>Search Recipe</label>
            <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Tag</label>
            <select 
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
            >
                <option value="All">All</option>
                {tags.map((tag) => (
                    <option key={tag} value={tag}>
                        {tag}
                    </option>
                ))}
            </select>
        </div>
    </section>
  )
}

export default SearchFilter