import { REST } from "@discordjs/rest";
import {
    RESTPostAPICurrentUserCreateDMChannelResult,
    Routes,
    APIEmbed,
} from "discord-api-types/v10";

export class DiscordClient {
    private rest: REST;
    private DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID
    constructor() {
        const botToken = process.env.DISCORD_BOT_TOKEN
        if (!botToken) throw new Error('Bot Token not found!')
        this.rest = new REST({ version: "10" }).setToken(
            botToken
        );
    }

    private async createDM() {
        return this.rest.post(Routes.userChannels(), {
            body: { recipient_id: this.DISCORD_CLIENT_ID },
        }) as Promise<RESTPostAPICurrentUserCreateDMChannelResult>;
    }

    async sendEmbed(embed: APIEmbed) {
        const channel = await this.createDM();

        this.rest.post(Routes.channelMessages(channel.id), {
            body: { embeds: [embed] },
        });
    }
}
