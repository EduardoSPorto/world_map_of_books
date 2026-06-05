// API Service for Book and Country queries

// Map Open Library bibliographic 3-letter codes to REST Countries terminology codes
const LANGUAGE_CODE_MAP = {
  'fre': 'fra', // French
  'ger': 'deu', // German
  'chi': 'zho', // Chinese
  'cze': 'ces', // Czech
  'dut': 'nld', // Dutch
  'gre': 'ell', // Greek
  'ice': 'isl', // Icelandic
  'mac': 'mkd', // Macedonian
  'rum': 'ron', // Romanian
  'slo': 'slk', // Slovak
  'per': 'fas', // Persian
  'wel': 'cym', // Welsh
  'tib': 'bod', // Tibetan
  'arm': 'hye', // Armenian
  'baq': 'eus', // Basque
  'bur': 'mya', // Burmese
  'geo': 'kat', // Georgian
  'alb': 'sqi', // Albanian
  'may': 'msa', // Malay
  'mao': 'mri', // Maori
};

// Friendly language names for UI display
const LANGUAGE_NAMES = {
  'eng': 'English',
  'spa': 'Spanish',
  'por': 'Portuguese',
  'fre': 'French',
  'fra': 'French',
  'ger': 'German',
  'deu': 'German',
  'chi': 'Chinese',
  'zho': 'Chinese',
  'ita': 'Italian',
  'rus': 'Russian',
  'jpn': 'Japanese',
  'kor': 'Korean',
  'dut': 'Dutch',
  'nld': 'Dutch',
  'cze': 'Czech',
  'ces': 'Czech',
  'swe': 'Swedish',
  'dan': 'Danish',
  'nor': 'Norwegian',
  'pol': 'Polish',
  'tur': 'Turkish',
  'gre': 'Greek',
  'ell': 'Greek',
  'heb': 'Hebrew',
  'ara': 'Arabic',
  'lat': 'Latin',
  'hin': 'Hindi',
  'yid': 'Yiddish',
  'vie': 'Vietnamese',
  'rum': 'Romanian',
  'ron': 'Romanian',
  'ice': 'Icelandic',
  'isl': 'Icelandic',
  'wel': 'Welsh',
  'cym': 'Welsh',
  'geo': 'Georgian',
  'kat': 'Georgian',
  'arm': 'Armenian',
  'hye': 'Armenian',
  'baq': 'Basque',
  'eus': 'Basque',
  'bur': 'Burmese',
  'mya': 'Burmese',
  'per': 'Persian',
  'fas': 'Persian',
  'slo': 'Slovak',
  'slk': 'Slovak',
  'mac': 'Macedonian',
  'mkd': 'Macedonian',
  'may': 'Malay',
  'msa': 'Malay',
  'mao': 'Maori',
  'mri': 'Maori',
  'fin': 'Finnish',
  'cat': 'Catalan',
  'bul': 'Bulgarian',
  'ukr': 'Ukrainian',
  'hrv': 'Croatian',
  'srp': 'Serbian',
  'slv': 'Slovenian',
  'est': 'Estonian',
  'lav': 'Latvian',
  'lit': 'Lithuanian',
  'tha': 'Thai',
  'ind': 'Indonesian',
  'gle': 'Irish',
  'bre': 'Breton',
  'nob': 'Norwegian Bokmål',
  'cor': 'Cornish',
  'epo': 'Esperanto',
  'lez': 'Lezghian',
  'ang': 'Old English'
};

/**
 * Translate a language code to friendly display name
 * @param {string} code 3-letter language code
 * @returns {string} Friendly name or code if not found
 */
export const getLanguageName = (code) => {
  if (!code) return 'Unknown';
  const cleanCode = code.toLowerCase().trim();
  return LANGUAGE_NAMES[cleanCode] || cleanCode.toUpperCase();
};

/**
 * Search books by title from Open Library
 * @param {string} title Search query
 * @returns {Promise<Array>} List of mapped book results
 */
export const searchBooks = async (title) => {
  if (!title || !title.trim()) return [];
  
  const response = await fetch(
    `https://openlibrary.org/search.json?title=${encodeURIComponent(title.trim())}&limit=30`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch books from Open Library API.');
  }
  
  const data = await response.json();
  
  if (!data.docs) return [];
  
  return data.docs.map((doc) => {
    const authors = doc.author_name ? doc.author_name.join(', ') : 'Unknown Author';
    const firstLanguage = doc.language && doc.language.length > 0 ? doc.language[0] : null;
    
    return {
      id: doc.key || Math.random().toString(36).substr(2, 9),
      title: doc.title,
      authors,
      year: doc.first_publish_year || 'N/A',
      languages: doc.language || [],
      primaryLanguage: firstLanguage,
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      coverUrlLarge: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    };
  });
};

/**
 * Fetch list of countries that speak the given language code from REST Countries API
 * @param {string} langCode 3-letter language code
 * @returns {Promise<Array>} List of mapped country results
 */
export const getCountriesByLanguage = async (langCode) => {
  if (!langCode) return [];
  
  const cleanCode = langCode.toLowerCase().trim();
  // Map bibliographic code to standard code if exists, otherwise use the code as is
  const queryCode = LANGUAGE_CODE_MAP[cleanCode] || cleanCode;
  
  try {
    const response = await fetch(`https://restcountries.com/v3.1/lang/${queryCode}`);
    
    // REST Countries API returns 404 if no countries are found for the language
    if (response.status === 404) {
      return [];
    }
    
    if (!response.ok) {
      throw new Error(`REST Countries API returned status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];
    
    return data.map((country) => {
      const currencies = country.currencies 
        ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ')
        : 'N/A';
      
      const languages = country.languages
        ? Object.values(country.languages).join(', ')
        : 'N/A';
        
      return {
        name: country.name.common,
        officialName: country.name.official,
        flag: country.flags.png,
        flagSvg: country.flags.svg,
        latlng: country.latlng, // [latitude, longitude]
        capital: country.capital ? country.capital.join(', ') : 'N/A',
        population: country.population,
        currencies,
        languages
      };
    });
  } catch (error) {
    console.error('Error fetching countries by language:', error);
    throw error;
  }
};
