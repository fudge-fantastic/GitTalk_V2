import { Ollama, OllamaEmbeddings } from "@langchain/ollama";
import { promises as fs } from "fs";

const ollama_embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text:latest", 
  baseUrl: "http://127.0.0.1:11434", 
});

export const ollama_model = new Ollama({
  baseUrl: "http://127.0.0.1:11434",
  model: "deepseek-coder:6.7b",
});

// Works slow but effective
export async function saveText() {
  try {
    const pre_input = "Your Code file content"; const inputText = "Your input text";
    const completion = await ollama_model.invoke(pre_input + inputText);
    await fs.writeFile("my_summary.txt", completion, "utf8");
    console.log(`Text File Saved`);
  } catch (error) {
    console.error("Failed to save text:", error);
  }
}

export async function ollamaEmbeddingsForSummary(page_content: string) {
  try {
    const result = await ollama_embeddings.embedQuery(page_content);
    console.log("Embeddings generated");
    return result;
  } catch (error) {
    console.log(
      "Error generating embeddings from ollamaEmbeddingsForSummary()",
      error
    );
    // throw error;
    return []
  }
}
