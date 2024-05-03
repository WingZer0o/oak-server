import { PrismaClient } from "../../generated/client/deno/edge.ts";
import { Router, RouterContext } from "../../deps.ts";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "npm:@langchain/core/prompts";
import { ChatOllama } from "npm:@langchain/community/chat_models/ollama";
import { jwtRouteValidation } from "../middleware/jwt-validation.ts";
import { ChatChannel, ChatMessage } from "../../generated/client/index.d.ts";
import { AIMessage, HumanMessage } from "npm:@langchain/core/messages";
import { StringOutputParser } from "npm:@langchain/core/output_parsers";
import { RedisCacheKeys } from "../../common/redis/redis-cache-keys.ts";
import redisClient from "../../common/redis/redis-client.ts";
import { ChatMessageDto } from "../../models/chat/chat-message-dto.ts";
import {
  ChatChannelDto,
  ChatChannelListDto,
} from "../../models/chat/chat-channel-list-dto.ts";
import { ChatChannelResponseDto } from "../../models/chat/chat-channel-response-dto.ts";
import { AddChatChannelDto } from "../../models/chat/add-chat-channel-dto.ts";

const prisma = new PrismaClient();
const router = new Router();

router.post("/add-chat-channel", jwtRouteValidation, async (
  context: RouterContext<
    "/add-chat-channel",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const body: AddChatChannelDto = await context.request.body.json();
    const newChatChannel = await prisma.chatChannel.create({
      data: {
        chatChannelName: body.channelName,
        userId: context.state.userId,
      },
    });
    const newChatChannelDto = new ChatChannelDto(newChatChannel.id, newChatChannel.chatChannelName, newChatChannel.userId);
    context.response.status = 200;
    context.response.body = newChatChannelDto;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

router.get("/chat-channel-list", jwtRouteValidation, async (
  context: RouterContext<
    "/chat-channel-list",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    let chatChannels: ChatChannel[] = await prisma.chatChannel.findMany({
      where: { userId: context.state.userId },
      orderBy: { createdAt: "desc" },
    });
    if (chatChannels?.length === 0) {
      const newChatChanel = await prisma.chatChannel.create({
        data: {
          userId: context.state.userId,
          chatChannelName: "Default Chat Channel",
        },
      });
      chatChannels.push(newChatChanel);
    }

    const chatChannelsListDto: ChatChannelListDto = new ChatChannelListDto(
      chatChannels.map((chatChannel: ChatChannel) => {
        return new ChatChannelDto(
          chatChannel.id,
          chatChannel.chatChannelName,
          chatChannel.userId,
        );
      }),
    );
    context.response.status = 200;
    context.response.body = chatChannelsListDto;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

router.get("/chat-channel", jwtRouteValidation, async (
  context: RouterContext<
    "/chat-channel",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const chatChannelId = context.request.url.searchParams.get("channelId");
    let chatChannel: ChatChannel = await prisma.chatChannel.findFirst({
      where: { id: chatChannelId,  },
      include: { chatMessages: { orderBy: { timestamp: "asc" } } },
    });
    if (!chatChannel) {
      chatChannel = await prisma.chatChannel.create({
        data: {
          userId: context.state.userId,
          chatChannelName: "Default Chat Channel",
        },
      });
    }
    const chatMessages = chatChannel?.chatMessages?.map(
      (chatMessage: ChatMessage) => {
        return new ChatMessageDto(
          chatMessage.id,
          chatMessage.message,
          chatMessage.timestamp,
          chatMessage.isChatBot,
          chatMessage.chatChannelId,
          chatMessage.userId,
          true,
        );
      },
    );
    context.response.status = 200;
    context.response.body = new ChatChannelResponseDto(
      chatChannel.id,
      chatMessages,
    );
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

router.post("/simple-chat", jwtRouteValidation, async (
  context: RouterContext<
    "/simple-chat",
    Record<string | number, string | undefined>,
    Record<string, any>
  >,
) => {
  try {
    const body: ChatMessage = await context.request.body.json();
    // TODO: chat channels needs to be tied specific chat windows in the UI. For now we will be a single chat channel for all messages.
    const newUserMessage = await prisma.chatMessage.create({
      data: {
        id: body.id,
        message: body.message,
        timestamp: body.timestamp,
        isChatBot: body.isChatBot,
        chatChannelId: body.chatChannelId,
        userId: body.userId,
      },
    });
    const cacheKey = RedisCacheKeys.ChatHistory + body.chatChannelId;
    let cacheChatMessages = await redisClient.get(cacheKey);
    if (!cacheChatMessages) {
      cacheChatMessages = await prisma.chatMessage.findMany({
        where: { chatChannelId: body.chatChannelId },
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
        chatChannelId: body.chatChannelId,
        userId: context.state.userId,
      },
    });
    cacheChatMessages.push(newChatBotMessage);
    await redisClient.set(cacheKey, JSON.stringify(cacheChatMessages), {
      EX: 60 * 60,
    });
    context.response.status = 200;
    context.response.body = newChatBotMessage;
  } catch (error) {
    context.response.status = 500;
    context.response.body = { message: error.message };
  }
});

export default router;
