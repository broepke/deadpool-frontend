import { apiClient } from '../client';
import { Person, PersonUpdate, PeopleQueryParams, PaginatedPeopleResponse } from '../types';

const BASE_PATH = '/api/v1/deadpool/people';

export const peopleApi = {
  // Get all people with pagination, filtering, and sorting support
  getAll: async (params?: PeopleQueryParams): Promise<PaginatedPeopleResponse> => {
    return apiClient.get<PaginatedPeopleResponse>(BASE_PATH, params);
  },

  // Get a single person by ID
  getById: async (personId: string): Promise<Person> => {
    return apiClient.get<Person>(`${BASE_PATH}/${personId}`);
  },

  // Update a person's information
  update: async (personId: string, data: PersonUpdate): Promise<Person> => {
    return apiClient.put<Person>(`${BASE_PATH}/${personId}`, data);
  },
};