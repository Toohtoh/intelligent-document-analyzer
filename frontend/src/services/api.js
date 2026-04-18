import { useAuth0 } from "@auth0/auth0-react";

const API_BASE_URL = process.env.REACT_APP_API_URL ||
  "https://app-docanalyzer-25eb89.azurewebsites.net/api/v1";

const AUTH0_AUDIENCE = "https://docanalyzer-api";

// Hook-based API — use this inside React components
export function useApi() {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = async () => {
    return await getAccessTokenSilently({
      authorizationParams: { audience: AUTH0_AUDIENCE },
    });
  };

  const uploadAndAnalyze = async (file) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE_URL}/upload-and-analyze`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Upload failed");
    }
    return response.json();
  };

  const listDocuments = async (limit = 20) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/documents?limit=${limit}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to fetch documents");
    return response.json();
  };

  const getDocument = async (documentId) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Document not found");
    return response.json();
  };

  const deleteDocument = async (documentId) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Failed to delete document");
    return response.json();
  };

  const askQuestion = async (documentId, text, question) => {
    const token = await getToken();
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ document_id: documentId, text, question }),
    });
    if (!response.ok) throw new Error("Failed to get answer");
    return response.json();
  };

  return { uploadAndAnalyze, listDocuments, getDocument, deleteDocument, askQuestion };
}