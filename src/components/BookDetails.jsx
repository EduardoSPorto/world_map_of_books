import React from 'react';
import { ArrowLeft, Globe, Star } from 'lucide-react';
import { BookOpen } from 'lucide-react';
import { getLanguageName } from '../services/api';

const BookDetails = ({
  book,
  originalLanguage,
  resolvingLanguage,
  selectedLanguage,
  onLanguageSelect,
  onBack,
}) => {
  if (!book) return null;

  const { title, authors, year, coverUrlLarge, languages } = book;

  // Translations = all languages except the resolved original
  const translationLanguages = languages.filter(
    (l) => l.toLowerCase() !== originalLanguage?.toLowerCase()
  );

  return (
    <div className="details-container">
      <button className="back-button" onClick={onBack} aria-label="Back to search results">
        <ArrowLeft size={16} />
        Back to results
      </button>

      <div className="book-detail-main">
        {/* Hero: Cover + basic metadata */}
        <div className="book-detail-hero">
          <div className="book-detail-cover-wrapper">
            {coverUrlLarge ? (
              <img
                src={coverUrlLarge}
                alt={`Cover of ${title}`}
                className="book-detail-cover"
              />
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

        {/* Language sections */}
        <div className="book-detail-specs">
          {/* Original Language */}
          <div className="language-section">
            <span className="language-section-title">
              <Star size={10} /> Original Language
            </span>

            {resolvingLanguage ? (
              <div className="language-resolving">
                <div className="spinner-xs" />
                Identifying original language…
              </div>
            ) : originalLanguage ? (
              <div className="language-tags-container">
                <button
                  className={`language-tag original ${
                    selectedLanguage?.toLowerCase() === originalLanguage.toLowerCase()
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => onLanguageSelect(originalLanguage)}
                  title={`Map countries where ${getLanguageName(originalLanguage)} is spoken`}
                >
                  {getLanguageName(originalLanguage)} ({originalLanguage.toUpperCase()})
                </button>
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No language information available
              </span>
            )}
          </div>

          {/* Translations / See Also */}
          {translationLanguages.length > 0 && (
            <div className="language-section">
              <span className="language-section-title">
                <Globe size={10} /> See also — Translations
              </span>
              <div className="language-tags-container">
                {translationLanguages.map((langCode) => {
                  const isActive =
                    selectedLanguage?.toLowerCase() === langCode.toLowerCase();
                  return (
                    <button
                      key={langCode}
                      className={`language-tag ${isActive ? 'active' : ''}`}
                      onClick={() => onLanguageSelect(langCode)}
                      title={`Map countries where ${getLanguageName(langCode)} is spoken`}
                    >
                      {getLanguageName(langCode)} ({langCode.toUpperCase()})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contextual hint about currently mapped language */}
          {selectedLanguage && (
            <div className="map-context-box">
              <Globe size={18} />
              <div>
                {selectedLanguage?.toLowerCase() === originalLanguage?.toLowerCase() ? (
                  <>
                    Highlighting countries where the original language,{' '}
                    <strong>{getLanguageName(selectedLanguage)}</strong>, is spoken.
                  </>
                ) : (
                  <>
                    Showing countries for the{' '}
                    <strong>{getLanguageName(selectedLanguage)}</strong> translation.
                    {originalLanguage && (
                      <>
                        {' '}
                        <button
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-secondary)',
                            cursor: 'pointer',
                            padding: 0,
                            font: 'inherit',
                            fontSize: '0.85rem',
                            textDecoration: 'underline',
                          }}
                          onClick={() => onLanguageSelect(originalLanguage)}
                        >
                          Back to original
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
