import axios from 'axios';

// Ensure base URL matches Spring Boot default locally
const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface InterviewQuestion {
  difficulty: string;
  title: string;
  frequency: string;
  acceptanceRate: string;
  link: string;
  topics: string;
}

export const getCompanies = async (): Promise<string[]> => {
  const response = await axios.get(`${API_BASE_URL}/interviews/companies`);
  return response.data;
};

export const getCompanyQuestions = async (company: string): Promise<InterviewQuestion[]> => {
  const response = await axios.get(`${API_BASE_URL}/interviews/companies/${company}/questions`);
  return response.data;
};
