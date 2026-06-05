import React from 'react';
import { Search, AlertCircle, Map } from 'lucide-react';

// Loader spinner
export const Spinner = ({ text = 'Loading...' }) => (
  <div className="loader-container">
    <div className="spinner" role="status" aria-label="loading"></div>
    <span className="loader-text">{text}</span>
  </div>
);

// Empty State for results/map
export const EmptyState = ({ type = 'search', title, message }) => {
  const isSearch = type === 'search';
  
  return (
    <div className="empty-state">
      {isSearch ? <Search size={48} /> : <Map size={48} />}
      <h3 className="empty-state-title">{title || (isSearch ? 'Start Exploring' : 'Interactive Map')}</h3>
      <p className="empty-state-desc">
        {message || (isSearch 
          ? 'Enter a book title to search the Open Library catalog and discover its languages.' 
          : 'Select a book to display the languages and highlight corresponding countries on the map.')}
      </p>
    </div>
  );
};

// Error Panel
export const ErrorState = ({ title = 'An error occurred', message }) => (
  <div className="error-state" role="alert">
    <AlertCircle size={20} />
    <div>
      <h4 className="error-title">{title}</h4>
      <p>{message}</p>
    </div>
  </div>
);

// Skeletons for Book list
export const SkeletonList = ({ count = 5 }) => (
  <div className="skeleton-list" aria-label="Loading results">
    {Array.from({ length: count }).map((_, i) => (
      <div className="skeleton-card" key={i}>
        <div className="skeleton skeleton-cover"></div>
        <div className="skeleton-info">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-author"></div>
          <div className="skeleton skeleton-meta"></div>
        </div>
      </div>
    ))}
  </div>
);
