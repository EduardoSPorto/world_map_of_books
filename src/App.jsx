import React, { useState } from 'react';
import SearchPanel from './components/SearchPanel';
import BookMap from './components/BookMap';
import { searchBooks, getCountriesByLanguage, resolveOriginalLanguage } from './services/api';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // The resolved original language of the selected book
  const [originalLanguage, setOriginalLanguage] = useState(null);
  // The language currently being visualised on the map (original or a translation)
  const [selectedLanguage, setSelectedLanguage] = useState(null);

  const [countries, setCountries] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(false);
  // True while the edition API call that resolves the original language is in flight
  const [resolvingLanguage, setResolvingLanguage] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [searchError, setSearchError] = useState(null);
  const [mapError, setMapError] = useState(null);

  // ── Search ──────────────────────────────────────────────────────────────────

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoadingBooks(true);
    setSearchError(null);
    resetBookState();

    try {
      const books = await searchBooks(query);
      setSearchResults(books);
    } catch (err) {
      setSearchError(
        err.message || 'Unable to connect to Open Library API. Check your network connection.'
      );
      setSearchResults([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  // ── Book selection ───────────────────────────────────────────────────────────

  const handleBookSelect = async (book) => {
    setSelectedBook(book);
    setMapError(null);
    setCountries([]);
    setOriginalLanguage(null);
    setSelectedLanguage(null);

    if (book.languages.length === 0) return;

    // Resolve the original language in the background while the details pane opens
    setResolvingLanguage(true);
    try {
      const resolved = await resolveOriginalLanguage(
        book.coverEditionKey,
        book.title,
        book.languages
      );
      setOriginalLanguage(resolved);
      setSelectedLanguage(resolved);
      if (resolved) fetchCountryData(resolved);
    } catch (err) {
      console.error('Language resolution failed, using first available:', err);
      const fallback = book.languages[0];
      setOriginalLanguage(fallback);
      setSelectedLanguage(fallback);
      if (fallback) fetchCountryData(fallback);
    } finally {
      setResolvingLanguage(false);
    }
  };

  // ── Language switching (original ↔ translation) ───────────────────────────

  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setMapError(null);
    fetchCountryData(langCode);
  };

  // ── Country data fetch ────────────────────────────────────────────────────

  const fetchCountryData = async (langCode) => {
    setLoadingCountries(true);
    setMapError(null);
    try {
      const countryList = await getCountriesByLanguage(langCode);
      setCountries(countryList);
    } catch (err) {
      setMapError(err.message || 'Unable to connect to REST Countries API.');
      setCountries([]);
    } finally {
      setLoadingCountries(false);
    }
  };

  // ── Clear / back ─────────────────────────────────────────────────────────

  const resetBookState = () => {
    setSelectedBook(null);
    setOriginalLanguage(null);
    setSelectedLanguage(null);
    setCountries([]);
    setMapError(null);
    setResolvingLanguage(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSearchError(null);
    resetBookState();
  };

  const handleBackToSearch = () => {
    resetBookState();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <main className="app-container">
      <SearchPanel
        query={query}
        setQuery={setQuery}
        searchResults={searchResults}
        selectedBook={selectedBook}
        originalLanguage={originalLanguage}
        resolvingLanguage={resolvingLanguage}
        selectedLanguage={selectedLanguage}
        loading={loadingBooks}
        error={searchError}
        onSearch={handleSearch}
        onBookSelect={handleBookSelect}
        onLanguageSelect={handleLanguageSelect}
        onClearSearch={handleClearSearch}
        onBackToSearch={handleBackToSearch}
      />

      <BookMap
        countries={countries}
        language={selectedLanguage}
        loading={loadingCountries}
        error={mapError}
      />
    </main>
  );
}

export default App;
