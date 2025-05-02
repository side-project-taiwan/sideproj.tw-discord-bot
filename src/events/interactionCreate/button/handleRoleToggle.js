// src/events/interaction/handlers/handleRoleToggle.js
module.exports = async (client, interaction) => {
  const role = interaction.guild.roles.cache.get(interaction.customId);
  if (!role) {
    return interaction.reply({ content: "找不到這個角色", ephemeral: true });
  }

  const hasRole = interaction.member.roles.cache.has(role.id);
  if (hasRole) {
    await interaction.member.roles.remove(role);
    return interaction.reply({
      content: `已移除角色 ${role.name}`,
      ephemeral: true,
    });
  } else {
    await interaction.member.roles.add(role);
    return interaction.reply({
      content: `已賦予角色 ${role.name}`,
      ephemeral: true,
    });
  }
};
