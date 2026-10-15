
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const token = process.env.DISCORD_TOKEN;
const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;

client.once("ready", () => {
  console.log(`🐱 Meow6 is online as ${client.user.tag}`);
});

// Welcome new members
client.on("guildMemberAdd", async (member) => {
  const channel =
    member.guild.channels.cache.get(welcomeChannelId) ||
    member.guild.systemChannel;

  if (!channel) return;

  try {
    await channel.send(
      `👋 Welcome ${member} to **${member.guild.name}**!`
    );
  } catch (error) {
    console.error("Welcome message failed:", error);
  }
});

// Commands
client.on("messageCreate", async (message) => {
  if (!message.guild || message.author.bot) return;

  const args = message.content.trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  if (command === "!help") {
    return message.reply(
      "**🐱 Meow6 Commands**\n" +
      "`!ban @member [reason]`\n" +
      "`!kick @member [reason]`\n" +
      "`!help`"
    );
  }

  if (command !== "!ban" && command !== "!kick") return;

  const isBan = command === "!ban";
  const permission = isBan
    ? PermissionsBitField.Flags.BanMembers
    : PermissionsBitField.Flags.KickMembers;

  if (!message.member.permissions.has(permission)) {
    return message.reply("❌ You don't have permission to do that.");
  }

  const botMember = message.guild.members.me;

  if (!botMember.permissions.has(permission)) {
    return message.reply("❌ I need the required permission.");
  }

  const member = message.mentions.members.first();

  if (!member) {
    return message.reply(`Usage: ${command} @member [reason]`);
  }

  if (member.id === message.author.id || member.id === client.user.id) {
    return message.reply("❌ You can't target yourself or the bot.");
  }

  if (
    message.guild.ownerId !== message.author.id &&
    member.roles.highest.comparePositionTo(
      message.member.roles.highest
    ) >= 0
  ) {
    return message.reply("❌ Your highest role must be above theirs.");
  }

  if (
    member.roles.highest.comparePositionTo(
      botMember.roles.highest
    ) >= 0
  ) {
    return message.reply("❌ Move my role above the target's role.");
  }

  const reason = args.join(" ") || "No reason provided";

  try {
    if (isBan) {
      await member.ban({ reason });
    } else {
      await member.kick(reason);
    }

    await message.reply(
      `✅ **${member.user.tag}** was ${
        isBan ? "banned" : "kicked"
      }. Reason: ${reason}`
    );
  } catch (error) {
    console.error(error);
    await message.reply(
      "❌ Action failed. Check the bot's role and permissions."
    );
  }
});

client.on("error", console.error);

if (!token) {
  throw new Error("Missing DISCORD_TOKEN environment variable!");
}

client.login(token);
  
