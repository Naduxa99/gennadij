const Telegraf = require('telegraf');
const chats = process.env.TELEGRAM_CHATS;
let bot;

function init() {
	return new Promise(function(resolve, reject) {
		bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
		bot.command('start', ctx => {
			console.log(ctx.message.chat.id);
		});
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
		sendMessage(chatId, message).then(function(result) {
			console.log(result);
		});
	})
}

module.exports = {
	init,
	sendMessageAll
};