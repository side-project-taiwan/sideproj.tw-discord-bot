const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: (client, interaction) => {
    // options
    const num1 = interaction.options.getNumber("first_number");
    const num2 = interaction.options.getNumber("second_number");
    console.log(num1, num2);
    interaction.reply(`The sum is ${num1 + num2}`);
  },
  
  //base command data
  name: "add",
  description: "add!",
  //   devOnly: true,  // Boolean
  //   testOnly: true, // Boolean
  options: [
    {
      name: "first_number",
      description: "The first number",
      type: ApplicationCommandOptionType.Number,
      choices: [
        {
          name: "One",
          value: 1,
        },
        {
          name: "Two",
          value: 2,
        },
        {
          name: "Three",
          value: 3,
        },
      ],
      required: true,
    },
    {
      name: "second_number",
      description: "The second number",
      type: ApplicationCommandOptionType.Number,
      choices: [
        {
          name: "One",
          value: 1,
        },
        {
          name: "Two",
          value: 2,
        },
        {
          name: "Three",
          value: 3,
        },
      ],
      required: true,
    },
  ],
  deleted: true, // Boolean
};
