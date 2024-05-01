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
import { RedisCacheKeys } from "../../common/redis/redis-cache-keys.ts";
import redisClient from "../../common/redis/redis-client.ts";

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
    const newUserMessage = await prisma.chatMessage.create({
      data: {
        message: body.message,
        timestamp: new Date(),
        isChatBot: false,
        chatHistoryId: body.chatChannelId,
        userId: context.state.userId,
      },
    });
    const cacheKey = RedisCacheKeys.ChatHistory + body.chatChannelId;
    let cacheChatMessages = await redisClient.get(cacheKey);
    if (!cacheChatMessages) {
      cacheChatMessages = await prisma.chatMessage.findMany({
        where: { chatHistoryId: body.chatChannelId },
        orderBy: { timestamp: "asc" },
      });
      if (cacheChatMessages?.length > 0) {
        await redisClient.set(cacheKey, JSON.stringify(cacheChatMessages), {
          EX: 60 * 60,
        });
      }
    } else {
      cacheChatMessages = JSON.parse(cacheChatMessages);
      cacheChatMessages.push(newUserMessage);
    }
    const chatModel = new ChatOllama({
      baseUrl: Deno.env.get("LLM_URL"),
      model: Deno.env.get("LLM_MODEL"),
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
      chatHistory: cacheChatMessages.map((chatMessage: ChatMessage) => {
        return (chatMessage.isChatBot)
          ? new AIMessage(chatMessage.message)
          : new HumanMessage(chatMessage.message);
      }),
      question: body.message,
    });
    const newChatBotMessage = await prisma.chatMessage.create({
      data: {
        message: response,
        timestamp: new Date(),
        isChatBot: true,
        chatHistoryId: body.chatChannelId,
        userId: context.state.userId,
      },
    });
    cacheChatMessages.push(newChatBotMessage);
    await redisClient.set(cacheKey, JSON.stringify(cacheChatMessages), {
      EX: 60 * 60,
    });
    context.response.status = 200;
    context.response.body = new SimpleChatResponseDto(response);
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

export default router;
