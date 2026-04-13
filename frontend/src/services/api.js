const API_BASE_URL = process.env.REACT_APP_API_URL || 
  "https://app-docanalyzer-25eb89.azurewebsites.net/api/v1";

export const uploadAndAnalyze = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE_URL}/upload-and-analyze`, {
    method: "POST", body: formData,
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Upload failed");
  }
  return response.json();
};

export const listDocuments = async (limit = 20) => {
  const response = await fetch(`${API_BASE_URL}/documents?limit=${limit}`);
  if (!response.ok) throw new Error("Failed to fetch documents");
  return response.json();
};

export const getDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
  if (!response.ok) throw new Error("Document not found");
  return response.json();
};

export const deleteDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete document");
  return response.json();
};

export const askQuestion = async (documentId, text, question) => {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ document_id: documentId, text, question }),
  });
  if (!response.ok) throw new Error("Failed to get answer");
  return response.json();
};