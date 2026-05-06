const {
  Client,
  GatewayIntentBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder
} = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once('ready', () => {
  console.log(`Bot běží jako ${client.user.tag}`);
});

/* =========================
   /panel - embed + button
========================= */
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'panel') {

    const embed = new EmbedBuilder()
      .setTitle('Žádost o allowlist')
      .setDescription(
        'Klikni na tlačítko pro podání žádosti.\n\n' +
        'Podáním žádosti potvrzuješ, že znáš RP pravidla:\n' +
        'FearRP, PowerGaming, MetaGaming.'
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
});

/* =========================
   BUTTON -> FORM
========================= */
client.on('interactionCreate', async interaction => {

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
      .setLabel('Proč chceš hrát na serveru')
      .setStyle(TextInputStyle.Paragraph);

    const rp = new TextInputBuilder()
      .setCustomId('rp')
      .setLabel('Co je PowerGaming?')
      .setStyle(TextInputStyle.Paragraph);

    const meta = new TextInputBuilder()
      .setCustomId('meta')
      .setLabel('Co je MetaGaming?')
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(
      new ActionRowBuilder().addComponents(age),
      new ActionRowBuilder().addComponents(reason),
      new ActionRowBuilder().addComponents(rp),
      new ActionRowBuilder().addComponents(meta)
    );

    await interaction.showModal(modal);
  }

  /* =========================
     FORM SUBMIT
  ========================= */
  if (interaction.isModalSubmit()) {

    const age = interaction.fields.getTextInputValue('age');
    const reason = interaction.fields.getTextInputValue('reason');
    const rp = interaction.fields.getTextInputValue('rp');
    const meta = interaction.fields.getTextInputValue('meta');

    const embed = new EmbedBuilder()
      .setTitle('Nová žádost o allowlist')
      .setColor(0x00ff99)
      .addFields(
        { name: 'Věk', value: age },
        { name: 'Důvod', value: reason },
        { name: 'PowerGaming', value: rp },
        { name: 'MetaGaming', value: meta }
      );

    const channel = await client.channels.fetch('SEM_DEJ_ID_KANALU');
    channel.send({ embeds: [embed] });

    await interaction.reply({
      content: 'Žádost byla odeslána.',
      ephemeral: true
    });
  }
});

client.login(process.env.MTQ4OTQwNjM5Njg2Mzg3NzE4MA.Gc7Q9u.blaHITgadIUHewNaOaCoPUvHyVj3WbF2JKgXzw);
