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

// ID kanálu kam budou chodit žádosti
const CHANNEL_ID = 'SEM_DEJ_ID_KANALU';

// ID role kterou dostane hráč po schválení
const ROLE_ID = 'SEM_DEJ_ID_ROLE';

// ID bota
const CLIENT_ID = 'SEM_DEJ_CLIENT_ID';

/* =========================
   SLASH COMMAND
========================= */

const commands = [
  new SlashCommandBuilder()
    .setName('panel')
    .setDescription('Pošle allowlist panel')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
  console.log(`${client.user.tag} je online`);

  try {
    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log('Slash command načten');
  } catch (error) {
    console.log(error);
  }
});

/* =========================
   PANEL
========================= */

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {

    if (interaction.commandName === 'panel') {

      const embed = new EmbedBuilder()
        .setTitle('Žádost o allowlist')
        .setDescription(
          'Klikni na tlačítko níže pro vytvoření žádosti.\n\n' +
          'Odesláním žádosti potvrzuješ znalost RP pravidel:\n' +
          '• FearRP\n' +
          '• MetaGaming\n' +
          '• PowerGaming'
        )
        .setColor(0x2b2d31);

      const button = new ButtonBuilder()
        .setCustomId('apply')
        .setLabel('Požádat o allowlist')
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder().addComponents(button);

      await interaction.reply({
        embeds: [embed],
        components: [row]
      });
    }
  }

  /* =========================
     OTEVŘENÍ FORMULÁŘE
  ========================= */

  if (interaction.isButton()) {

    if (interaction.customId === 'apply') {

      const modal = new ModalBuilder()
        .setCustomId('allowlist_form')
        .setTitle('Allowlist žádost');

      const age = new TextInputBuilder()
        .setCustomId('age')
        .setLabel('Kolik ti je let?')
        .setStyle(TextInputStyle.Short);

      const reason = new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Proč chceš hrát na serveru?')
        .setStyle(TextInputStyle.Paragraph);

      const pg = new TextInputBuilder()
        .setCustomId('pg')
        .setLabel('Co je PowerGaming?')
        .setStyle(TextInputStyle.Paragraph);

      const mg = new TextInputBuilder()
        .setCustomId('mg')
        .setLabel('Co je MetaGaming?')
        .setStyle(TextInputStyle.Paragraph);

      modal.addComponents(
        new ActionRowBuilder().addComponents(age),
        new ActionRowBuilder().addComponents(reason),
        new ActionRowBuilder().addComponents(pg),
        new ActionRowBuilder().addComponents(mg)
      );

      await interaction.showModal(modal);
    }

    /* =========================
       SCHVÁLENÍ
    ========================= */

    if (interaction.customId.startsWith('accept_')) {

      const userId = interaction.customId.split('_')[1];

      const member = await interaction.guild.members.fetch(userId);

      await member.roles.add(ROLE_ID);

      await interaction.update({
        content: `✅ <@${userId}> byl schválen.`,
        embeds: [],
        components: []
      });
    }

    /* =========================
       ZAMÍTNUTÍ
    ========================= */

    if (interaction.customId.startsWith('deny_')) {

      const userId = interaction.customId.split('_')[1];

      await interaction.update({
        content: `❌ <@${userId}> byl zamítnut.`,
        embeds: [],
        components: []
      });
    }
  }

  /* =========================
     ODESLÁNÍ FORMULÁŘE
  ========================= */

  if (interaction.isModalSubmit()) {

    if (interaction.customId === 'allowlist_form') {

      const age = interaction.fields.getTextInputValue('age');
      const reason = interaction.fields.getTextInputValue('reason');
      const pg = interaction.fields.getTextInputValue('pg');
      const mg = interaction.fields.getTextInputValue('mg');

      const embed = new EmbedBuilder()
        .setTitle('Nová allowlist žádost')
        .setDescription(`Žadatel: <@${interaction.user.id}>`)
        .addFields(
          { name: 'Věk', value: age },
          { name: 'Důvod', value: reason },
          { name: 'PowerGaming', value: pg },
          { name: 'MetaGaming', value: mg }
        )
        .setColor(0x00ff99);

      const accept = new ButtonBuilder()
        .setCustomId(`accept_${interaction.user.id}`)
        .setLabel('SCHVÁLIT')
        .setStyle(ButtonStyle.Success);

      const deny = new ButtonBuilder()
        .setCustomId(`deny_${interaction.user.id}`)
        .setLabel('ZAMÍTNOUT')
        .setStyle(ButtonStyle.Danger);

      const row = new ActionRowBuilder()
        .addComponents(accept, deny);

      const channel = await client.channels.fetch(CHANNEL_ID);

      await channel.send({
        embeds: [embed],
        components: [row]
      });

      await interaction.reply({
        content: 'Žádost byla odeslána.',
        ephemeral: true
      });
    }
  }
});

client.login(TOKEN);
