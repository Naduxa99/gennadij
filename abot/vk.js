const easyvk = require("easyvk");
let VK;

function init() {
	return new Promise(function (resolve, reject) {
		easyvk({
			username: process.env.VK_LOGIN,
			password: process.env.VK_PASSWORD,
			save_session: false
		}).then(vk => {
			VK = vk;
			resolve(vk);
		}).catch(console.error);
	});
}

function sendMessage(user_id, text) {
	return new Promise(function(resolve){
		VK.call('messages.send', {
			message: text,
			user_id: user_id
		}).then(({vkr}) => {
			resolve(vkr);
		});
	});
}

function getMessages(user_id, n) {
	return new Promise(function(resolve){
		VK.call('messages.getHistory', {
			user_id: user_id,
			count: n
		}).then(({vkr}) => {
			resolve(vkr.items);
		});
	});
}

function getPosts(owner_id, n) {
	return new Promise(function(resolve,reject) {
		VK.call('wall.get', {
			owner_id: owner_id,
			count: n
		}).then(({vkr}) => {
			resolve(vkr.items);
		}).catch(error => {
			reject(error);
		});
	})
}

module.exports = {
	init,
	sendMessage,
	getMessages,
	getPosts
};