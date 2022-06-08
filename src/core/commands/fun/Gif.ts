import { Context, MessageEmbed } from "oasis-framework";
import type { User } from "discordeno";
import type { BotWithCache } from "discordeno/cache-plugin";
import { Argument, Command } from "oasis-framework";
import funGifs from "../../constants/gifs.js";

@Command
export class Gif {
    readonly data = {
        name: "gif",
        description: "Sends a random gif.",
    };


    // TODO: Choices
    @Argument("The type of gif such as hug, kiss, cuddle, etc...", true)
    type!: string;

    @Argument.User("The user you wish to mention.")
    user!: User;

    get options(): unknown[] {
        return [this.type, this.user];
    }

    async run(ctx: Context<BotWithCache>) {
        const type = ctx.options.getString("type", true) ?? ctx.options.getString(0, true);
        const userId = ctx.options.getUser("user") ?? ctx.options.getUser(1);

        const gifs = funGifs.get(type);
        if (!gifs) {
            await ctx.respondPrivately({
                with: `This type of gif is not available. The valid types are: **${[
                    ...funGifs.keys(),
                ].join(", ")}**`,
            });
            return;
        }

        if (!userId) {
            await ctx.respond({ with: chooseRandom(gifs) });
            return;
        }

        await ctx.respond({
            with: `<@${userId}>`,
            mentions: { users: [userId] },
            embeds: [new MessageEmbed().color("random").image(chooseRandom(gifs))],
        });
    }
}

export function chooseRandom<T>(array: T[]) {
    return array[Math.floor(Math.random() * array.length)]!;
}
