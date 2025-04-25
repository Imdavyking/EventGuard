import { BACKEND_URL } from "../utils/constants";

export const callLLMApi = async ({
  userPrompt,
  userAddress,
}: {
  userPrompt: string;
  userAddress: string;
}) => {
  const response = await fetch(`${BACKEND_URL}/api/llm/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ userPrompt, userAddress }),
  });
  if (!response.ok) {
    throw new Error("Failed to fetch llm response");
  }
  return await response.json();
};
