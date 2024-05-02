import { ChatMessage } from "../../generated/client/index.d.ts";

export class ChatChannelResponseDto {
    public channelId: number;
    public chatMessages: ChatMessage[];

    constructor(channelId: number, chatMessages: ChatMessage[]) {
        this.channelId = channelId;
        this.chatMessages = chatMessages;
    }
}