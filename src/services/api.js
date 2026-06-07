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

// Override dictionary for famous works to guarantee their canonical original language
const FAMOUS_BOOKS_ORIGINAL_LANGUAGES = {
  'hobbit': 'eng',
  'lord of the rings': 'eng',
  'quixote': 'spa',
  'quijote': 'spa',
  'petit prince': 'fre',
  'little prince': 'fre',
  'odyssey': 'gre',
  'iliad': 'gre',
  'divina commedia': 'ita',
  'divine comedy': 'ita',
  'miserables': 'fre',
  'faust': 'ger',
  'trial': 'ger',
  'metamorphosis': 'ger',
  'war and peace': 'rus',
  'crime and punishment': 'rus',
  'karamazov': 'rus',
  'one hundred years of solitude': 'spa',
  'cien anos de soledad': 'spa',
  'pride and prejudice': 'eng',
  'hamlet': 'eng',
  'romeo': 'eng',
  'gatsby': 'eng',
  'ulysses': 'eng',
  'hundred years of solitude': 'spa',
  'moby dick': 'eng',
  'dracula': 'eng',
  'sherlock': 'eng'
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
      coverEditionKey: doc.cover_edition_key || null,
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
      coverUrlLarge: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : null,
    };
  });
};

/**
 * Resolves the original language of a book using overrides, edition API queries, or heuristics
 * @param {string} coverEditionKey Cover edition ID (e.g. OL51711263M)
 * @param {string} title Book title
 * @param {Array<string>} languages Mapped list of language codes
 * @returns {Promise<string>} The resolved original language code
 */
export const resolveOriginalLanguage = async (coverEditionKey, title, languages = []) => {
  if (languages.length === 0) return null;
  if (languages.length === 1) return languages[0];

  const lowerTitle = title.toLowerCase().trim();

  // Tier 1: Check manual overrides for famous books
  for (const [key, lang] of Object.entries(FAMOUS_BOOKS_ORIGINAL_LANGUAGES)) {
    if (lowerTitle.includes(key)) {
      // Confirm the mapped code is in the book languages, otherwise continue
      const matched = languages.find(l => l.toLowerCase() === lang);
      if (matched) return matched;
      
      // Handle bibliographic code mapping differences (e.g. fre vs fra)
      const alternateLang = Object.keys(LANGUAGE_CODE_MAP).find(
        key => LANGUAGE_CODE_MAP[key] === lang || key === lang
      );
      const matchedAlt = alternateLang && languages.find(l => l.toLowerCase() === alternateLang);
      if (matchedAlt) return matchedAlt;
    }
  }

  // Tier 2: Check Cover Edition Details (if coverEditionKey is present)
  if (coverEditionKey) {
    try {
      const response = await fetch(`https://openlibrary.org/books/${coverEditionKey}.json`);
      if (response.ok) {
        const edition = await response.json();
        
        // If the edition is a translation, look at what it was translated from
        if (edition.translated_from && edition.translated_from.length > 0) {
          const transLangKey = edition.translated_from[0].key; // e.g. "/languages/eng"
          const code = transLangKey.split('/').pop()?.toLowerCase();
          if (code && languages.some(l => l.toLowerCase() === code)) {
            return languages.find(l => l.toLowerCase() === code);
          }
        }
        
        // Otherwise, use the language of this edition
        if (edition.languages && edition.languages.length > 0) {
          const langKey = edition.languages[0].key; // e.g. "/languages/eng"
          const code = langKey.split('/').pop()?.toLowerCase();
          if (code && languages.some(l => l.toLowerCase() === code)) {
            return languages.find(l => l.toLowerCase() === code);
          }
        }
      }
    } catch (err) {
      console.warn('Failed to retrieve cover edition details for language resolution, falling back:', err);
    }
  }

  // Tier 3: Apply structural title keyword heuristics to guess
  const titleWords = lowerTitle.split(/\s+/);
  
  // English heuristic
  const engWords = ['the', 'of', 'and', 'in', 'to', 'for', 'with', 'on', 'by', 'at'];
  if (languages.some(l => l.toLowerCase() === 'eng') && titleWords.some(w => engWords.includes(w))) {
    return 'eng';
  }

  // Spanish heuristic
  const spaWords = ['el', 'la', 'los', 'las', 'un', 'una', 'de', 'en', 'y', 'con', 'por', 'para'];
  if (languages.some(l => l.toLowerCase() === 'spa') && titleWords.some(w => spaWords.includes(w))) {
    return 'spa';
  }

  // French heuristic
  const freWords = ['le', 'la', 'les', 'un', 'une', 'de', 'en', 'et', 'dans', 'sur', 'pour', 'avec'];
  const freCodes = ['fre', 'fra'];
  const availableFre = languages.find(l => freCodes.includes(l.toLowerCase()));
  if (availableFre && titleWords.some(w => freWords.includes(w))) {
    return availableFre;
  }

  // German heuristic
  const gerWords = ['der', 'die', 'das', 'ein', 'eine', 'und', 'in', 'mit', 'von', 'zu', 'auf'];
  const gerCodes = ['ger', 'deu'];
  const availableGer = languages.find(l => gerCodes.includes(l.toLowerCase()));
  if (availableGer && titleWords.some(w => gerWords.includes(w))) {
    return availableGer;
  }

  // Default: Fall back to the first available language code
  return languages[0];
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
