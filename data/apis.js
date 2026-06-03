// ============================================================
// APIVerse — Mock API Catalog
// ============================================================

export const CATEGORIES = ['Weather', 'Movies', 'Crypto', 'GitHub', 'Countries'];

export const APIS = [
  {
    id: 'open-meteo',
    name: 'Open-Meteo',
    description: 'Free weather forecast API with no API key required. Global coverage with hourly and daily data.',
    category: 'Weather',
    authType: 'None',
    baseUrl: 'https://api.open-meteo.com',
    popularity: 94,
    endpoints: [
      {
        id: 'current-weather',
        name: 'Current Weather',
        method: 'GET',
        path: '/v1/forecast',
        params: [
          { key: 'latitude', val: '40.7128' },
          { key: 'longitude', val: '-74.0060' },
          { key: 'current_weather', val: 'true' },
        ],
      },
    ],
  },
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    description: 'Current weather, forecasts, and historical data for any location worldwide.',
    category: 'Weather',
    authType: 'API Key',
    baseUrl: 'https://api.openweathermap.org',
    popularity: 88,
    endpoints: [
      {
        id: 'current',
        name: 'Current Weather',
        method: 'GET',
        path: '/data/2.5/weather',
        params: [
          { key: 'q', val: 'London' },
          { key: 'appid', val: 'YOUR_API_KEY' },
          { key: 'units', val: 'metric' },
        ],
      },
    ],
  },
  {
    id: 'tmdb',
    name: 'TMDB',
    description: 'The Movie Database — discover movies, TV shows, actors, and images.',
    category: 'Movies',
    authType: 'API Key',
    baseUrl: 'https://api.themoviedb.org/3',
    popularity: 91,
    endpoints: [
      {
        id: 'search-movie',
        name: 'Search Movies',
        method: 'GET',
        path: '/search/movie',
        params: [
          { key: 'api_key', val: 'YOUR_API_KEY' },
          { key: 'query', val: 'inception' },
        ],
      },
      {
        id: 'popular',
        name: 'Popular Movies',
        method: 'GET',
        path: '/movie/popular',
        params: [{ key: 'api_key', val: 'YOUR_API_KEY' }],
      },
    ],
  },
  {
    id: 'omdb',
    name: 'OMDb',
    description: 'Open Movie Database — search and retrieve detailed movie information by title or IMDb ID.',
    category: 'Movies',
    authType: 'API Key',
    baseUrl: 'https://www.omdbapi.com',
    popularity: 76,
    endpoints: [
      {
        id: 'by-title',
        name: 'Search by Title',
        method: 'GET',
        path: '/',
        params: [
          { key: 't', val: 'Inception' },
          { key: 'apikey', val: 'YOUR_API_KEY' },
        ],
      },
    ],
  },
  {
    id: 'coingecko',
    name: 'CoinGecko',
    description: 'Comprehensive cryptocurrency data — prices, market cap, volume, and historical charts.',
    category: 'Crypto',
    authType: 'None',
    baseUrl: 'https://api.coingecko.com',
    popularity: 93,
    endpoints: [
      {
        id: 'simple-price',
        name: 'Simple Price',
        method: 'GET',
        path: '/api/v3/simple/price',
        params: [
          { key: 'ids', val: 'bitcoin,ethereum' },
          { key: 'vs_currencies', val: 'usd' },
        ],
      },
      {
        id: 'trending',
        name: 'Trending Coins',
        method: 'GET',
        path: '/api/v3/search/trending',
        params: [],
      },
    ],
  },
  {
    id: 'coincap',
    name: 'CoinCap',
    description: 'Real-time cryptocurrency pricing and market activity data.',
    category: 'Crypto',
    authType: 'None',
    baseUrl: 'https://api.coincap.io',
    popularity: 72,
    endpoints: [
      {
        id: 'assets',
        name: 'List Assets',
        method: 'GET',
        path: '/v2/assets',
        params: [{ key: 'limit', val: '10' }],
      },
    ],
  },
  {
    id: 'github',
    name: 'GitHub REST API',
    description: 'Access repositories, issues, users, and organizations on GitHub.',
    category: 'GitHub',
    authType: 'Bearer',
    baseUrl: 'https://api.github.com',
    popularity: 97,
    endpoints: [
      {
        id: 'user',
        name: 'Get User',
        method: 'GET',
        path: '/users/octocat',
        params: [],
      },
      {
        id: 'repos',
        name: 'List Repos',
        method: 'GET',
        path: '/users/octocat/repos',
        params: [
          { key: 'sort', val: 'updated' },
          { key: 'per_page', val: '5' },
        ],
      },
    ],
  },
  {
    id: 'github-gists',
    name: 'GitHub Gists',
    description: 'Create, read, update, and delete gists on GitHub.',
    category: 'GitHub',
    authType: 'Bearer',
    baseUrl: 'https://api.github.com',
    popularity: 65,
    endpoints: [
      {
        id: 'public-gists',
        name: 'Public Gists',
        method: 'GET',
        path: '/gists/public',
        params: [{ key: 'per_page', val: '5' }],
      },
    ],
  },
  {
    id: 'restcountries',
    name: 'REST Countries',
    description: 'Get information about countries — names, capitals, regions, flags, and currencies.',
    category: 'Countries',
    authType: 'None',
    baseUrl: 'https://restcountries.com',
    popularity: 89,
    endpoints: [
      {
        id: 'by-name',
        name: 'Search by Name',
        method: 'GET',
        path: '/v3.1/name/united',
        params: [],
      },
      {
        id: 'all',
        name: 'All Countries',
        method: 'GET',
        path: '/v3.1/all',
        params: [{ key: 'fields', val: 'name,capital,flags' }],
      },
    ],
  },
  {
    id: 'countries-now',
    name: 'Countries Now',
    description: 'Population, cities, flags, and currency data for countries worldwide.',
    category: 'Countries',
    authType: 'None',
    baseUrl: 'https://countriesnow.space',
    popularity: 68,
    endpoints: [
      {
        id: 'population',
        name: 'Population',
        method: 'GET',
        path: '/api/v0.1/countries/population',
        params: [{ key: 'country', val: 'canada' }],
      },
    ],
  },
  {
    id: 'cat-facts',
    name: 'Cat Facts',
    description: 'Random cat facts API — fun demo endpoint with no authentication.',
    category: 'Weather',
    authType: 'None',
    baseUrl: 'https://catfact.ninja',
    popularity: 55,
    endpoints: [
      {
        id: 'fact',
        name: 'Random Fact',
        method: 'GET',
        path: '/fact',
        params: [],
      },
    ],
  },
];

export function getApiById(id) {
  return APIS.find((a) => a.id === id) ?? null;
}

export function getDefaultEndpoint(api) {
  return api?.endpoints?.[0] ?? null;
}

export function filterApis({ category = 'all', query = '', favoritesOnly = false, favIds = [] } = {}) {
  let list = [...APIS];

  if (category && category !== 'all') {
    list = list.filter((a) => a.category === category);
  }

  if (favoritesOnly) {
    list = list.filter((a) => favIds.includes(a.id));
  }

  if (query.trim()) {
    const q = query.trim().toLowerCase();
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }

  return list;
}
