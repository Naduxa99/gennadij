const schedule = require('node-schedule');

const sourceVkId = process.env.VK_DETECTIT;
let lastTime = 0;
let wait = false;
let telegram;
let vk;
const timeOut = 30000;
const sendedMsgs = [];
let isStoped = true;

function getPhotoLink(photoObj) {
	const photoSizes = Object.keys(photoObj).filter(name => (/^photo_/gi).test(name)).map(name => Number(name.match(/(\d)+/i)[0]));
	return photoObj['photo_' + Math.max(...photoSizes)];
}

function getMessageText(post) {
	let photoLinks = '';
	(post.attachments || []).forEach(function(attach) {
		if (!attach.photo) return;
		photoLinks += ' ' + getPhotoLink(attach.photo);
	});
	return post.body + photoLinks;
}

function searchCodeWord(post) {
	if (!post.text || post.text <=  0) return false;
	const strings = post.text.split('\n');
	const codeWords = [];
	for (let i=0; i < strings.length; i++) {
		const word = (/Кодовое.*слово[^"]*"([^"]+)"/gi).exec(strings[i]);
		if (word) codeWords.push(word[1]);
	}
	return codeWords[0];
}

function waitingForAnswer(msgId, task) {
	vk.getMessages(sourceVkId, 1).then(function(msgs) {
		const lastMsg = msgs[0];
		if (lastMsg.id > msgId) {
			wait = false;
			const message = getMessageText(lastMsg);
			telegram.sendMessageAll(task + '\n' + message);
		}

		if (wait) setTimeout(waitingForAnswer, 5000, msgId, task);
	});
}

function isSendedCodeWord(word) {
	for (let i = 0; i < sendedMsgs.length; i++) {
		if (sendedMsgs[i].search(word) != -1) return true;
	}
	return false;
}

function watch(counter) {
	if (isStoped || counter > 100) return;
	vk.getPosts(sourceVkId, 3).then(function(posts) {
		posts.forEach(function(post) {
			if (post.date > lastTime) {
				const codeWord = searchCodeWord(post);
				if (codeWord && !isSendedCodeWord(codeWord)) {
					sendedMsgs.push(codeWord);
					vk.sendMessage(sourceVkId, codeWord).then(function(msgId) {
						wait = true;
						waitingForAnswer(msgId, post.text);
					});
					stopWatch();
				}
			}
			lastTime = Math.max(post.date, lastTime);
		});
		setTimeout(watch, timeOut, ++counter);
	});
}

function startWatch() {
	sendedMsgs.length = 0;
	vk.getMessages(sourceVkId, 20).then(function(msgs) {
		msgs.forEach(function(msg) {
			sendedMsgs.push(msg.body);
		});
		isStoped = false;
		watch(0);
	});
}

function stopWatch() {
	isStoped = true;
}

module.exports = {
	init: function(t, v) {
		telegram = t;
		vk = v;
		const sheduledTaskPrepare = schedule.scheduleJob(process.env.SHEDULE_TIME_PREPARE, function(){
			telegram.sendMessageAll('Скоро шифры!!!');
		});
		const sheduledTask = schedule.scheduleJob(process.env.SHEDULE_TIME, function(){
			startWatch();
		});
	},
	startWatch: function() {
		startWatch();
	},
	stopWatch: function() {
		stopWatch();
	}
};