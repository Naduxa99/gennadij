require('./passwd.js')();
const vk = require('./abot/vk.js');
const telegram = require('./abot/telegram.js');
const logic = require('./abot/logic.js');

Promise.all([telegram.init(logic.startWatch, logic.stopWatch), vk.init()]).then(function([telegramObject,vkObject]) {
	logic.init(telegram, vk);
}).catch(function (error) {
	console.log(error);
});