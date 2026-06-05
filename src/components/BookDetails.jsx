import React from 'react';
import { ArrowLeft, Globe, BookOpen } from 'lucide-react';
import { getLanguageName } from '../services/api';

const BookDetails = ({ book, selectedLanguage, onLanguageSelect, onBack }) => {
  if (!book) return null;

  const { title, authors, year, coverUrlLarge, languages } = book;

  return (
    <div className="details-container">
      <button className="back-button" onClick={onBack} aria-label="Go back to search results">
        <ArrowLeft size={16} />
        Back to results
      </button>

      <div className="book-detail-main">
        <div className="book-detail-hero">
          <div className="book-detail-cover-wrapper">
            {coverUrlLarge ? (
              <img src={coverUrlLarge} alt={`Cover of ${title}`} className="book-detail-cover" />
            ) : (
              <div className="book-detail-no-cover">
                <BookOpen size={40} />
                <span>No Cover</span>
              </div>
            )}
          </div>
          <div className="book-detail-meta-primary">
            <h2 className="book-detail-title">{title}</h2>
            <p className="book-detail-author">{authors}</p>
            <p className="book-detail-year">Published: {year}</p>
          </div>
        </div>

        <div className="book-detail-specs">
          <div className="spec-item">
            <span className="spec-label">Language(s):</span>
            <span className="spec-value">
              {languages.length === 0 ? 'None specified' : `${languages.length} detected`}
            </span>
          </div>

          {languages.length > 0 && (
            <div className="language-tags-container" aria-label="Book languages">
              {languages.map((langCode) => {
                const isSelected = selectedLanguage?.toLowerCase() === langCode.toLowerCase();
                return (
                  <button
                    key={langCode}
                    className={`language-tag ${isSelected ? 'active' : ''}`}
                    onClick={() => onLanguageSelect(langCode)}
                    title={`Highlight countries where ${getLanguageName(langCode)} is spoken`}
                  >
                    {getLanguageName(langCode)} ({langCode.toUpperCase()})
                  </button>
                );
              })}
            </div>
          )}

          {selectedLanguage && (
            <div className="map-context-box">
              <Globe size={18} />
              <div>
                Mapping countries speaking <strong>{getLanguageName(selectedLanguage)}</strong>. 
                {languages.length > 1 && " Click other languages above to map them."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
