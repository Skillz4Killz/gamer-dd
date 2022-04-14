import type { ApplicationCommandOption, Bot } from 'discordeno';
import { ApplicationCommandTypes, upsertApplicationCommands } from 'discordeno';
import { commandAliases, commands, Context } from 'oasis-framework';
import { config } from './config';

export function enableMiddleware(bot: Bot): Bot {
    const { interactionCreate, messageCreate, ready } = bot.events;

    bot.events.interactionCreate = (bot, interaction) => {
        if (interaction.user.toggles.bot) {
            // if is bot forward the event
            interactionCreate(bot, interaction);
            return;
        }

        const ctx = new Context(config.prefix, bot, undefined, interaction);

        const commandName = ctx.getCommandName();

        if (!commandName) {
            return;
        }

        const [command] = commands.get(commandName) ?? [];

        // check if command exists
        if (command) {
            command.run(ctx); // do not await
        }

        interactionCreate(bot, interaction);
    };

    bot.events.messageCreate = (bot, message) => {
        if (message.isBot) {
            // if is bot forward the event
            messageCreate(bot, message);
            return;
        }
        const ctx = new Context(config.prefix, bot, message, undefined);

        const commandName = ctx.getCommandName();

        if (!commandName) {
            return;
        }

        // deno-fmt-ignore
        const [command] = commands.get(commandName) ?? commands.get(commandAliases.get(commandName) ?? '') ?? [];

        // check if command exists
        if (command) {
            command.run(ctx); // do not await
        }

        messageCreate(bot, message);
    };

    bot.events.ready = async (bot, payload, rawPayload) => {
        if (config.development) {
            // register the commands on one server
            await upsertApplicationCommands(
                bot,
                commands.map(([command, options]) => {
                    return {
                        name: command.data.name,
                        description: command.data.description,
                        options: options as ApplicationCommandOption[],
                        type: ApplicationCommandTypes.ChatInput,
                        defaultPermission: true,
                    };
                }),
                BigInt(config.supportGuildId),
            );
        } else {
            // register the commands against the api
            await upsertApplicationCommands(
                bot,
                commands.map(([command, options]) => {
                    return {
                        name: command.data.name,
                        description: command.data.description,
                        options: options as ApplicationCommandOption[],
                        type: ApplicationCommandTypes.ChatInput,
                        defaultPermission: true,
                    };
                }),
                undefined,
            );
        }

        ready(bot, payload, rawPayload);
    };

    return bot;
}

export default enableMiddleware;