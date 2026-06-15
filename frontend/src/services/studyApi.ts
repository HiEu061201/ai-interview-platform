import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://ai-interview-backend-ns52.onrender.com/api' : 'http://localhost:8080/api')}` + '/study';

export interface StudyCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
}

export interface StudyMaterialSummary {
  id: number;
  title: string;
  slug: string;
  displayOrder: number;
}

export interface StudyMaterialDetail {
  id: number;
  title: string;
  slug: string;
  content: string;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
}

export interface InterviewNoteResponse {
  id: number;
  questionContent: string;
  userContent: string;
  suggestedAnswer: string;
  scoreClarity: number;
  scoreTechnical: number;
  scoreConfidence: number;
  categoryTopic: string;
  createdAt: string;
}

export const getStudyCategories = async (): Promise<StudyCategory[]> => {
  const response = await axios.get(`${API_BASE_URL}/categories`);
  return response.data;
};

export const getMaterialsByCategory = async (categorySlug: string): Promise<StudyMaterialSummary[]> => {
  const response = await axios.get(`${API_BASE_URL}/categories/${categorySlug}/materials`);
  return response.data;
};

export const getMaterialDetail = async (materialSlug: string): Promise<StudyMaterialDetail> => {
  const response = await axios.get(`${API_BASE_URL}/materials/${materialSlug}`);
  return response.data;
};

export const getMyNotes = async (): Promise<Record<string, InterviewNoteResponse[]>> => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_BASE_URL}/my-notes`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return response.data;
};
