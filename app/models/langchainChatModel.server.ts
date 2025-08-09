import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { v4 as uuidv4 } from "uuid";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// Step-1 (No-changes)
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    "You talk like a pirate. Answer all questions to the best of your ability.",
  ],
  ["placeholder", "{messages}"],
]);

// Define the function that calls the model
const callModel = async (state: typeof MessagesAnnotation.State) => {
  const prompt = await promptTemplate.invoke(state);
  const response = await llm.invoke(prompt);
  // Update message history with response:
  return { messages: [response] };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  // Define the node and edge
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const app = workflow.compile({ checkpointer: new MemorySaver() });
const config2 = { configurable: { thread_id: uuidv4() } };

const input = [
  {
    role: "user",
    content: "Hi! I'm Bob.",
  },
];
const output = await app.invoke({ messages: input }, config2);
console.log(output.messages[output.messages.length - 1]);

const input2 = [
  {
    role: "user",
    content: "What's my name?",
  },
];
const output2 = await app.invoke({ messages: input2 }, config2);
console.log(output2.messages[output2.messages.length - 1]);