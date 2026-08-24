import apiClient from "./client";

export const getGoogleConnectUrl = async (): Promise<string> => {
  const response = await apiClient.get("/google/connect");

  return response.data.url;
};

export const disconnectGoogle = async () => {
  const response = await apiClient.delete("/google/disconnect");

  return response.data;
};
