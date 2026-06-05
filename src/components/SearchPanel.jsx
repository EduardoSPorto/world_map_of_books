import React from 'react';
import { Search, X } from 'lucide-react';
import BookCard from './BookCard';
import BookDetails from './BookDetails';
import { SkeletonList, EmptyState, ErrorState } from './Loader';

const SearchPanel = ({
  query,
  setQuery,
  searchResults,
  selectedBook,
  selectedLanguage,
  loading,
  error,
  onSearch,
  onBookSelect,
  onLanguageSelect,
  onClearSearch,
  onBackToSearch
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="sidebar" aria-label="Search and book details panel">
      <div className="sidebar-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/><path d="M8 14h8"/><path d="M4 6h2"/><path d="M4 10h2"/><path d="M4 14h2"/></svg>
        <h1 className="app-title">Atlas of Books</h1>
      </div>

      {!selectedBook ? (
        <>
          {/* Search Controls */}
          <form onSubmit={handleSubmit} className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search by book title..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search book by title"
              />
              <Search className="search-icon" size={18} />
              {query && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={onClearSearch}
                  aria-label="Clear search text"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </form>

          {/* Sidebar Content (Results or States) */}
          <div className="sidebar-content">
            {error && <ErrorState title="Search Failed" message={error} />}

            {loading ? (
              <SkeletonList count={5} />
            ) : searchResults.length > 0 ? (
              <>
                <p className="results-count">Found {searchResults.length} results</p>
                <div className="book-list" role="feed" aria-label="Book search results">
                  {searchResults.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelect={onBookSelect}
                      isSelected={selectedBook?.id === book.id}
                    />
                  ))}
                </div>
              </>
            ) : (
              !loading && !error && (
                <EmptyState
                  type="search"
                  title={query.trim() ? "No Results Found" : "Search for a Book"}
                  message={
                    query.trim()
                      ? `We couldn't find any books matching "${query}". Check your spelling or try another title.`
                      : "Type a book title (e.g. 'Don Quixote', 'The Hobbit') to display its languages and find where they are spoken on the map."
                  }
                />
              )
            )}
          </div>
        </>
      ) : (
        /* Selected Book Details View */
        <div className="sidebar-content" style={{ paddingTop: '20px' }}>
          <BookDetails
            book={selectedBook}
            selectedLanguage={selectedLanguage}
            onLanguageSelect={onLanguageSelect}
            onBack={onBackToSearch}
          />
        </div>
      )}
    </div>
  );
};

export default SearchPanel;
