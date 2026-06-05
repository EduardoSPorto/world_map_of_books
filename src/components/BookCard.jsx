import React from 'react';
import { BookOpen } from 'lucide-react';
import { getLanguageName } from '../services/api';

const BookCard = ({ book, onSelect, isSelected }) => {
  const { title, authors, year, coverUrl, primaryLanguage } = book;

  return (
    <button
      className={`book-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(book)}
      aria-label={`Select book ${title} by ${authors}`}
    >
      <div className="book-card-cover-wrapper">
        {coverUrl ? (
          <img src={coverUrl} alt={`Cover of ${title}`} className="book-card-cover" loading="lazy" />
        ) : (
          <div className="book-card-no-cover">
            <BookOpen size={20} />
            <span>NO COVER</span>
          </div>
        )}
      </div>
      <div className="book-card-info">
        <h3 className="book-card-title">{title}</h3>
        <p className="book-card-author">{authors}</p>
        <div className="book-card-meta">
          <span>{year}</span>
          {primaryLanguage && (
            <>
              <span>•</span>
              <span>{getLanguageName(primaryLanguage)}</span>
            </>
          )}
        </div>
      </div>
    </button>
  );
};

export default BookCard;
