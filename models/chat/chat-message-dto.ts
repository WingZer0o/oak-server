export class ChatMessageDto {
    public id: number;
    public message: string;
    public timestamp: Date;
    public isChatBot: boolean;
    public chatChannelId: number;
    public userId: number;
    public isFirstMessage: boolean = false;

    constructor(
        id: number,
        message: string,
        timestamp: Date,
        isChatBot: boolean,
        chatChannelId: number,
        userId: number,
        isFirstMessage: boolean = false,
    ) {
        this.id = id;
        this.message = message;
        this.timestamp = timestamp;
        this.isChatBot = isChatBot;
        this.chatChannelId = chatChannelId;
        this.userId = userId;
        this.isFirstMessage = isFirstMessage;
    }
}