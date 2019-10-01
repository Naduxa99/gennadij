const Telegraf = require('telegraf');
const chats = JSON.parse(process.env.TELEGRAM_CHATS);
let bot;

function init(lookFunction, stopFunction) {
	return new Promise(function(resolve, reject) {
		bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

		bot.command('start', ctx => {
			console.log(ctx.message.chat.id);
			ctx.reply('👍');
		});
		bot.command('start@gennadij_detectit_bot', ctx => {
			console.log(ctx.message.chat.id);
			ctx.reply('👍');
		});

		bot.startPolling();
		resolve(bot);
	});
}

function sendMessage(id,message) {
	bot.telegram.sendMessage(id, message).then(function(result) {
		console.log(result);
	});
}

function sendMessageAll(message) {
	chats.forEach(function(chatId) {
		sendMessage(chatId, message);
	})
}

module.exports = {
	init,
	sendMessageAll,
	sendMessage
};