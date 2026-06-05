import React, { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import BookMap from './components/BookMap';
import { searchBooks, getCountriesByLanguage } from './services/api';

function App() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [countries, setCountries] = useState([]);

  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [searchError, setSearchError] = useState(null);
  const [mapError, setMapError] = useState(null);

  // Trigger search from input query
  const handleSearch = async () => {
    if (!query || !query.trim()) return;

    setLoadingBooks(true);
    setSearchError(null);
    setSelectedBook(null);
    setSelectedLanguage(null);
    setCountries([]);
    setMapError(null);

    try {
      const books = await searchBooks(query);
      setSearchResults(books);
    } catch (err) {
      setSearchError(err.message || 'Unable to connect to Open Library API. Please check your network connection.');
      setSearchResults([]);
    } finally {
      setLoadingBooks(false);
    }
  };

  // Select a book from the list
  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setMapError(null);
    setCountries([]);

    if (book.primaryLanguage) {
      setSelectedLanguage(book.primaryLanguage);
      fetchCountryData(book.primaryLanguage);
    } else {
      setSelectedLanguage(null);
    }
  };

  // Change language dynamically (for books with multiple languages)
  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setMapError(null);
    fetchCountryData(langCode);
  };

  // Query country data based on language code
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

  // Clear search field and all states
  const handleClearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setSelectedBook(null);
    setSelectedLanguage(null);
    setCountries([]);
    setSearchError(null);
    setMapError(null);
  };

  // Return to the search list from details view
  const handleBackToSearch = () => {
    setSelectedBook(null);
    setSelectedLanguage(null);
    setCountries([]);
    setMapError(null);
  };

  return (
    <main className="app-container">
      {/* Sidebar Panel containing Search & Book Details */}
      <SearchPanel
        query={query}
        setQuery={setQuery}
        searchResults={searchResults}
        selectedBook={selectedBook}
        selectedLanguage={selectedLanguage}
        loading={loadingBooks}
        error={searchError}
        onSearch={handleSearch}
        onBookSelect={handleBookSelect}
        onLanguageSelect={handleLanguageSelect}
        onClearSearch={handleClearSearch}
        onBackToSearch={handleBackToSearch}
      />

      {/* Interactive Map Visualizer */}
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
