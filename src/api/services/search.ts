import { apiClient } from '../client';
import { SearchParams, SearchResponse } from '../types';

export const searchService = {
  /**
   * Search for people or players
   * @param params Search parameters including query string and filters
   * @returns Promise containing search results and metadata
   */
  search: async (params: SearchParams): Promise<SearchResponse> => {
    return apiClient.get<SearchResponse>('/api/v1/deadpool/search', params);
  }
};

export default searchService;