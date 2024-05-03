import { ChatMessageDto } from "./chat-message-dto.ts";

export class ChatChannelResponseDto {
    public channelId: string;
    public chatMessages: ChatMessageDto[];

    constructor(channelId: string, chatMessages: ChatMessageDto[]) {
        this.channelId = channelId;
        this.chatMessages = chatMessages;
    }
}