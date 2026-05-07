const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

/* =========================
   NASTAVENÍ
========================= */

const TOKEN = process.env.TOKEN;

const CHANNEL_ID = '1501257356619681822';
const ROLE_ID = '1492520259876421212';
const CLIENT_ID = '1489406396863877180';

/* =========================
   SLASH COMMAND
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Otevře allowlist panel')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`Online jako ${client.user.tag}`);

  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );
});

/* =========================
   PANEL
========================= */

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'panel') {

      const embed = new EmbedBuilder()
        .setTitle('Allowlist žádost')
        .setDescription('Klikni na tlačítko pro žádost.')
        .setColor(0x2b2d31);

      const button = new ButtonBuilder()
        .setCustomId('apply')
        .setLabel('Požádat o allowlist')
        .setStyle(ButtonStyle.Primary);

      await interaction.reply({
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(button)]
      });
    }
  }

  /* =========================
     FORMULÁŘ
  ========================= */

  if (interaction.isButton() && interaction.customId === 'apply') {

    const modal = new ModalBuilder()
      .setCustomId('form')
      .setTitle('Allowlist žádost');

    const age = new TextInputBuilder()
      .setCustomId('age')
      .setLabel('Věk')
      .setStyle(TextInputStyle.Short);

    const reason = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Proč chceš hrát?')
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(age),
      new ActionRowBuilder().addComponents(reason)
    );

    await interaction.showModal(modal);
  }

  /* =========================
     ODESLÁNÍ
  ========================= */

  if (interaction.isModalSubmit()) {

    const age = interaction.fields.getTextInputValue('age');
    const reason = interaction.fields.getTextInputValue('reason');

    const embed = new EmbedBuilder()
      .setTitle('Nová žádost')
      .addFields(
        { name: 'Věk', value: age },
        { name: 'Důvod', value: reason }
      )
      .setColor(0x00ff99);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const accept = new ButtonBuilder()
      .setCustomId(`accept_${interaction.user.id}`)
      .setLabel('SCHVÁLIT')
      .setStyle(ButtonStyle.Success);

    const deny = new ButtonBuilder()
      .setCustomId(`deny_${interaction.user.id}`)
      .setLabel('ZAMÍTNOUT')
      .setStyle(ButtonStyle.Danger);

    await channel.send({
      embeds: [embed],
      components: [new ActionRowBuilder().addComponents(accept, deny)]
    });

    await interaction.reply({
      content: 'Žádost odeslána.',
      ephemeral: true
    });
  }

  /* =========================
     ACCEPT
  ========================= */

  if (interaction.isButton() && interaction.customId.startsWith('accept_')) {

    const userId = interaction.customId.split('_')[1];
    const member = await interaction.guild.members.fetch(userId);

    await member.roles.add(ROLE_ID);

    await interaction.update({
      content: `✅ Schváleno: <@${userId}>`,
      components: []
    });
  }

  /* =========================
     DENY
  ========================= */

  if (interaction.isButton() && interaction.customId.startsWith('deny_')) {

    const userId = interaction.customId.split('_')[1];

    await interaction.update({
      content: `❌ Zamítnuto: <@${userId}>`,
      components: []
    });
  }
});

client.login(TOKEN);
