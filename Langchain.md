```tsx
// Statless memory
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  apiKey: process.env.GEMINI_API_KEY,
});

const callModel = async (state: typeof MessagesAnnotation.State) => {
  const response = await llm.invoke(state.messages);
  return { messages: response };
};

// Define a new graph
const workflow = new StateGraph(MessagesAnnotation)
  .addNode("model", callModel)
  .addEdge(START, "model")
  .addEdge("model", END);

// Add memory
const memory = new MemorySaver();
const app = workflow.compile({ checkpointer: memory });
// This enables us to support multiple conversation threads with a single application, a common requirement when your application has multiple users.
const config = { configurable: { thread_id: uuidv4() } };
const input = [
  {
    role: "user",
    content: "Hi! I'm Bluesalt.",
  },
];
const output = await app.invoke({ messages: input }, config);
// The output contains all messages in the state. This will log the last message in the conversation.
console.log("This is logging the last message", output.messages[output.messages.length - 1]);
console.log("This is logging all messages", output.messages);
```
OUTPUT
```shell
This is logging the last message 
AIMessage 
{
  "id": "c88dabd7-4eb2-453b-b573-74d3fb5c2b78",
  "content": "Hi Bluesalt! It's nice to meet you. Is there anything I can help you with today?\n",
  "additional_kwargs": {
    "finishReason": "STOP",
    "avgLogprobs": -0.10760558169821034
  },
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 8,
      "completionTokens": 23,
      "totalTokens": 31
    },
    "finishReason": "STOP",
    "avgLogprobs": -0.10760558169821034
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 8,
    "output_tokens": 23,
    "total_tokens": 31
  }
}
This is logging all messages [
  HumanMessage {
    "id": "581a62bb-f982-4c33-883b-4e639d6bcb0a",
    "content": "Hi! I'm Bluesalt.",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  AIMessage {
    "id": "c88dabd7-4eb2-453b-b573-74d3fb5c2b78",
    "content": "Hi Bluesalt! It's nice to meet you. Is there anything I can help you with today?\n",
    "additional_kwargs": {
      "finishReason": "STOP",
      "avgLogprobs": -0.10760558169821034
    },
    "response_metadata": {
      "tokenUsage": {
        "promptTokens": 8,
        "completionTokens": 23,
        "totalTokens": 31
      },
      "finishReason": "STOP",
      "avgLogprobs": -0.10760558169821034
    },
    "tool_calls": [],
    "invalid_tool_calls": [],
    "usage_metadata": {
      "input_tokens": 8,
      "output_tokens": 23,
      "total_tokens": 31
    }
  }
]
```

Changing the input:

```tsx
const input2 = [
  {
    role: "user",
    content: "Hi again! What's my name?",
  },
];
const output2 = await app.invoke({ messages: 
input2 }, config);
```

```shell
This is logging the last message AIMessage {
  "id": "07e466f4-31ce-4ddc-b35b-6778cd10e45b",
  "content": "Your name is Bluesalt.\n",
  "additional_kwargs": {
    "finishReason": "STOP",
    "avgLogprobs": -0.07249157769339425
  },
  "response_metadata": {
    "tokenUsage": {
      "promptTokens": 38,
      "completionTokens": 7,
      "totalTokens": 45
    },
    "finishReason": "STOP",
    "avgLogprobs": -0.07249157769339425
  },
  "tool_calls": [],
  "invalid_tool_calls": [],
  "usage_metadata": {
    "input_tokens": 38,
    "output_tokens": 7,
    "total_tokens": 45
  }
}
This is logging all messages [
  HumanMessage {
    "id": "06fdb8c5-4fb9-48e3-9f09-f8c3410c4444",
    "content": "Hi! I'm Bluesalt.",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  AIMessage {
    "id": "4f22e7ce-1fa5-49d3-a212-59013b2091f0",
    "content": "Hi Bluesalt! It's nice to meet you. What can I do for you today?\n",
    "additional_kwargs": {
      "finishReason": "STOP",
      "avgLogprobs": -0.03513057742800031
    },
    "response_metadata": {
      "tokenUsage": {
        "promptTokens": 8,
        "completionTokens": 21,
        "totalTokens": 29
      },
      "finishReason": "STOP",
      "avgLogprobs": -0.03513057742800031
    },
    "tool_calls": [],
    "invalid_tool_calls": []
  },
  HumanMessage {
    "id": "7e47715e-c84f-42c4-af67-dd785b1fad13",
    "content": "Hi again! What's my name?",
    "additional_kwargs": {},
    "response_metadata": {}
  },
  AIMessage {
    "id": "07e466f4-31ce-4ddc-b35b-6778cd10e45b",
    "content": "Your name is Bluesalt.\n",
    "additional_kwargs": {
      "finishReason": "STOP",
      "avgLogprobs": -0.07249157769339425
    },
    "response_metadata": {
      "tokenUsage": {
        "promptTokens": 38,
        "completionTokens": 7,
        "totalTokens": 45
      },
      "finishReason": "STOP",
      "avgLogprobs": -0.07249157769339425
    },
    "tool_calls": [],
    "invalid_tool_calls": [],
    "usage_metadata": {
      "input_tokens": 38,
      "output_tokens": 7,
      "total_tokens": 45
    }
  }
]
```