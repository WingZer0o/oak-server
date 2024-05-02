import { ChatMessageDto } from "./chat-message-dto.ts";

export class ChatChannelResponseDto {
    public channelId: number;
    public chatMessages: ChatMessageDto[];

    constructor(channelId: number, chatMessages: ChatMessageDto[]) {
        this.channelId = channelId;
        this.chatMessages = chatMessages;
    }
}