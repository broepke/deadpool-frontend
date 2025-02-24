# Search Implementation Plan

## Overview
Implement UI components and integration for the new search API endpoint that allows users to search for people and players with various filtering options.

## Technical Architecture

### 1. API Integration

#### TypeScript Types (`src/api/types.ts`)
```typescript
// Search Types
export interface SearchParams {
  q: string;
  type?: 'people' | 'players';
  mode?: 'fuzzy' | 'exact';
  limit?: number;
  offset?: number;
}

export interface SearchResultMetadata {
  Age?: number;
  BirthDate?: string;
  DeathDate?: string;
  WikiID?: string;
  WikiPage?: string;
}

export interface SearchResult {
  id: string;
  type: 'people' | 'players';
  attributes: {
    name: string;
    status: 'alive' | 'deceased';
    metadata: SearchResultMetadata;
  };
  score: number;
}

export interface SearchResponse {
  message: string;
  data: SearchResult[];
  metadata: {
    total: number;
    limit: number;
    offset: number;
    query: string;
  };
}
```

#### Search Service (`src/api/services/search.ts`)
```typescript
import { apiClient } from '../client';
import { SearchParams, SearchResponse } from '../types';

export const searchService = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    return apiClient.get<SearchResponse>('/api/v1/deadpool/search', params);
  }
};
```

### 2. UI Components

#### Component Structure

##### SearchBar Component (`src/components/common/SearchBar.tsx`)
```typescript
interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
  defaultType?: 'people' | 'players';
  defaultMode?: 'fuzzy' | 'exact';
}

// Features:
// - Debounced input (300ms)
// - Type selector dropdown
// - Search mode toggle
// - Clear button
// - Loading spinner integration
```

##### SearchResults Component (`src/components/common/SearchResults.tsx`)
```typescript
interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  error?: string;
  metadata: {
    total: number;
    limit: number;
    offset: number;
  };
  onPageChange: (offset: number) => void;
}

// Subcomponents:
// - ResultCard: Individual result display
// - Pagination: Page controls
// - EmptyState: No results view
// - ErrorState: Error display
// - LoadingState: Loading skeleton
```

##### ResultCard Component (`src/components/common/ResultCard.tsx`)
```typescript
interface ResultCardProps {
  result: SearchResult;
  onSelect?: (result: SearchResult) => void;
}

// Features:
// - Person/Player info display
// - Score indicator
// - Status badge
// - Metadata display
// - Click handling
```

#### State Management

##### Search Context (`src/context/SearchContext.tsx`)
```typescript
interface SearchState {
  params: SearchParams;
  results: SearchResult[];
  isLoading: boolean;
  error?: string;
  metadata: {
    total: number;
    limit: number;
    offset: number;
    query: string;
  };
}

interface SearchContextValue {
  state: SearchState;
  search: (params: Partial<SearchParams>) => Promise<void>;
  clearSearch: () => void;
  setSearchType: (type: 'people' | 'players') => void;
  setSearchMode: (mode: 'fuzzy' | 'exact') => void;
  setPage: (offset: number) => void;
}
```

##### URL State Management
- Sync search parameters with URL using React Router
- Enable shareable search results
- Preserve search state during navigation
- Handle browser back/forward navigation

#### Feature Integration Details

##### PeoplePage Integration (`src/features/people/PeoplePage.tsx`)
```typescript
// Add to existing state
const [searchParams, setSearchParams] = useState<SearchParams>({
  q: '',
  type: 'people',
  mode: 'fuzzy'
});

// Add to existing interface
interface PersonTableProps {
  people: Person[];
  searchResults: SearchResult[];
  isSearching: boolean;
  onPersonClick: (person: Person | SearchResult) => void;
}

// Modify existing fetchData to handle search
const fetchData = async () => {
  if (searchParams.q) {
    // Use search service
    const searchResponse = await searchService.search(searchParams);
    // Transform search results to match existing table structure
    const transformedResults = searchResponse.data.map(result => ({
      id: result.id,
      name: result.attributes.name,
      status: result.attributes.status,
      metadata: result.attributes.metadata
    }));
    setPeople(transformedResults);
    setPaginationMeta({
      total: searchResponse.metadata.total,
      page: Math.floor(searchResponse.metadata.offset / searchResponse.metadata.limit) + 1,
      page_size: searchResponse.metadata.limit,
      total_pages: Math.ceil(searchResponse.metadata.total / searchResponse.metadata.limit)
    });
  } else {
    // Existing people fetch logic
  }
};

// UI Integration
<div className="sm:flex sm:items-center">
  <div className="sm:flex-auto">
    <h1>People</h1>
    <p>A list of all people and their current status.</p>
  </div>
  <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-4">
    <SearchBar
      onSearch={(params) => {
        setSearchParams(params);
        setCurrentPage(1); // Reset pagination
      }}
      isLoading={loading}
      defaultType="people"
    />
    <select
      value={selectedStatus}
      onChange={(e) => handleStatusChange(e.target.value as StatusFilter)}
      disabled={!!searchParams.q} // Disable status filter during search
    >
      {/* Existing status options */}
    </select>
  </div>
</div>
```

##### PlayersPage Integration (`src/features/players/PlayersPage.tsx`)
```typescript
// Add to existing state
const [searchParams, setSearchParams] = useState<SearchParams>({
  q: '',
  type: 'players',
  mode: 'fuzzy'
});

// Modify fetchPlayers to handle search
const fetchPlayers = async () => {
  try {
    setLoading(true);
    if (searchParams.q) {
      const searchResponse = await searchService.search({
        ...searchParams,
        limit: 100 // Match current behavior of showing all results
      });
      
      // Transform search results to match Player interface
      const transformedResults = searchResponse.data.map(result => ({
        id: result.id,
        name: result.attributes.name,
        draft_order: result.attributes.metadata.draft_order || 0,
        year: selectedYear,
        phone_number: result.attributes.metadata.phone_number,
        phone_verified: result.attributes.metadata.phone_verified,
        sms_notifications_enabled: result.attributes.metadata.sms_notifications_enabled
      }));
      
      setPlayers(transformedResults);
      
      // Track search analytics
      analytics.trackEvent('PLAYER_SEARCH', {
        total_players: searchResponse.metadata.total,
        has_data: searchResponse.data.length > 0,
        search_query: searchParams.q,
        search_mode: searchParams.mode,
        year: selectedYear
      });
    } else {
      // Existing players fetch logic
      const response = await playersApi.getAll(selectedYear);
      setPlayers(response.data);
      
      // Existing analytics tracking
      analytics.trackEvent('PLAYER_SEARCH', {
        total_players: response.data.length,
        has_data: response.data.length > 0,
        years_represented: [...new Set(response.data.map(p => p.year))].sort(),
        filter_type: 'all'
      });
    }
    setError(null);
  } catch (err) {
    // Existing error handling
  } finally {
    setLoading(false);
  }
};

// UI Integration - Add SearchBar next to year filter
<div className="sm:flex sm:items-center">
  <div className="sm:flex-auto">
    <h1>Players</h1>
    <p>A list of all players participating in the game.</p>
  </div>
  <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-4">
    <SearchBar
      onSearch={(params) => {
        setSearchParams(params);
      }}
      isLoading={loading}
      defaultType="players"
    />
    <select
      value={selectedYear}
      onChange={(e) => handleYearChange(Number(e.target.value))}
      disabled={!!searchParams.q} // Disable year filter during search
      className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
    >
      {AVAILABLE_YEARS.map((year) => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  </div>
</div>
```

##### Shared Search Page (`src/features/search/SearchPage.tsx`)
```typescript
interface SearchPageProps {
  defaultType?: 'people' | 'players';
}

export default function SearchPage({ defaultType }: SearchPageProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    q: '',
    type: defaultType || 'people',
    mode: 'fuzzy',
    limit: 20
  });
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implementation details for a dedicated search experience
  // - Full-page search interface
  // - Advanced filtering options
  // - Detailed result views
  // - Search history
  // - Recent searches
}
```

##### Analytics Integration
```typescript
// Add new analytics events
export const SearchAnalyticsEvents = {
  SEARCH_PERFORMED: 'SEARCH_PERFORMED',
  SEARCH_RESULTS_VIEWED: 'SEARCH_RESULTS_VIEWED',
  SEARCH_RESULT_CLICKED: 'SEARCH_RESULT_CLICKED',
  SEARCH_ERROR: 'SEARCH_ERROR'
} as const;

// Track search analytics
analytics.trackEvent(SearchAnalyticsEvents.SEARCH_PERFORMED, {
  query: searchParams.q,
  type: searchParams.type,
  mode: searchParams.mode,
  results_count: searchResponse.metadata.total
});
```

### 3. Feature Integration
- Add search functionality to relevant pages:
  - PeoplePage
  - PlayersPage
- Consider adding a dedicated SearchPage for full-screen search experience

### 4. State Management
- Implement search state management
- Handle pagination state
- Manage filters and search parameters
- Cache recent search results

### 5. Error Handling
- Display appropriate error messages
- Handle API errors gracefully
- Validate input parameters

### 6. UX Considerations
- Debounce search input to prevent excessive API calls
- Show loading states during searches
- Maintain search state in URL for shareable links
- Implement keyboard navigation
- Ensure mobile responsiveness

## Implementation Phases

### Phase 1: Core Infrastructure
1. Create search service and types
2. Implement basic SearchBar component
3. Create SearchResults component
4. Add error handling utilities

### Phase 2: Feature Integration
1. Integrate search into PeoplePage
2. Integrate search into PlayersPage
3. Implement pagination
4. Add loading states

### Phase 3: Enhanced Features
1. Add type filtering
2. Implement search mode toggle
3. Add URL state management
4. Implement results caching

### Phase 4: Polish
1. Add keyboard navigation
2. Enhance mobile experience
3. Add analytics tracking
4. Performance optimizations

## Testing Strategy
- Unit tests for search service
- Component tests for SearchBar and SearchResults
- Integration tests for search flow
- E2E tests for critical search paths

## Metrics & Monitoring
- Track search usage
- Monitor API response times
- Track search result clicks
- Monitor error rates

## Future Considerations
- Advanced filtering options
- Search history
- Saved searches
- Search suggestions/autocomplete
- Results sorting options