import type { Context } from '../../deps/oasis.ts';
import { Command, Util } from '../../deps/oasis.ts';

@Command
export class Ping {
    readonly data = {
        name: 'ping',
        description: 'ping the bot',
    };

    #getPingFromContext(ctx: Context) {
        return Util.snowflakeToTimestamp(
            ctx.interactionContext?.interaction.id ??
                ctx.messageContext?.message.id ??
                0n,
        );
    }

    async run(ctx: Context) {
        const pingTimestamp = this.#getPingFromContext(ctx);
        await ctx.respondWith(`Pong! (${Date.now() - pingTimestamp}ms)`);
    }
}
