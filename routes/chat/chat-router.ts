import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { Router, RouterContext } from "../../deps.ts";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "npm:@langchain/core/prompts";
import { ChatOllama } from "npm:@langchain/community/chat_models/ollama";
import { SimpleChat } from "../../models/chat/simple-chat.ts";
import { jwtRouteValidation } from "../middleware/jwt-validation.ts";
import { ChatChannelResponseDto } from "../../models/chat/chat-channel-response-dto.ts";
import { ChatMessage } from "../../generated/client/index.d.ts";
import { AIMessage, HumanMessage } from "npm:@langchain/core/messages";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { SimpleChatResponseDto } from "../../models/chat/simple-chat-response-dto.ts";

const prisma = new PrismaClient();
const router = new Router();

router.get("/chat-channel", jwtRouteValidation, async (
  context: RouterContext<
    "/chat-channel",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  // TODO: ideally chat channels should be determined by the chat window that is open in the UI.
  // for the time being this will be a single chat channel for all messages.
  let chatChannel = await prisma.chatChannel.findFirst({
    where: { userId: context.state.userId },
  });
  if (!chatChannel) {
    await prisma.chatChannel.create({
      data: {
        userId: context.state.userId,
      },
    });
  }
  chatChannel = await prisma.chatChannel.findFirst({
    where: { userId: context.state.userId },
  });
  context.response.status = 200;
  context.response.body = new ChatChannelResponseDto(chatChannel.id);
});

router.post("/simple-chat", jwtRouteValidation, async (
  context: RouterContext<
    "/simple-chat",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const body: SimpleChat = await context.request.body.json();
  // TODO: chat channels needs to be tied specific chat windows in the UI. For now we will be a single chat channel for all messages.
  await prisma.chatMessage.create({
    data: {
      message: body.message,
      timestamp: new Date(),
      isChatBot: false,
      chatHistoryId: body.chatChannelId,
      userId: context.state.userId,
    },
  });
  const chatMessages: ChatMessage = await prisma.chatMessage.findMany({
    where: { chatHistoryId: body.chatChannelId },
    orderBy: { timestamp: "asc" },
  });
  const chatModel = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "llama3",
  });
  const contextualizeQSystemPrompt =
    `You are a helpful assistant with a smile on her face, no swearing, racism, etc. Given a chat history and the last user question which might 
  reference context in the chat history, generate a response that is relevant to the user question based on the information in the user chat and your other trained data sets.`;
  const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
    ["system", contextualizeQSystemPrompt],
    new MessagesPlaceholder("chatHistory"),
    ["user", "{question}"],
  ]);
  const contextualizeQChain = contextualizeQPrompt.pipe(chatModel).pipe(
    new StringOutputParser(),
  );
  const response = await contextualizeQChain.invoke({
    chatHistory: chatMessages.map((chatMessage: ChatMessage) => {
      return (chatMessage.isChatBot)
        ? new AIMessage(chatMessage.message)
        : new HumanMessage(chatMessage.message);
    }),
    question: body.message,
  });
    await prisma.chatMessage.create({
        data: {
        message: response,
        timestamp: new Date(),
        isChatBot: true,
        chatHistoryId: body.chatChannelId,
        userId: context.state.userId,
        },
    });
    context.response.status = 200;
    context.response.body = new SimpleChatResponseDto(response);
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

export default router;
