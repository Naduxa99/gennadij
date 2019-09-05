const sourceVkId = process.env.VK_DETECTIT;
let lastTime = 0;
let wait = false;
let telegram;
let vk;

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

function searchCodeWord(text) {
	const strings = text.split('\n');
	const codeWords = [];
	for (let i=0; i < strings.length; i++) {
		const word = (/Кодовое.*слово[^"]*"([^"]+)"/gi).exec(strings[i]);
		if (word) codeWords.push(word[1]);
	}
	return codeWords[0];
}

function waitingForAnswer(msgId, task) {
	console.log('waitingForAnswer');
	vk.getMessages(sourceVkId, 1).then(function(msgs) {
		const lastMsg = msgs.items[0];
		if (lastMsg.id > msgId) {
			wait = false;
			const message = getMessageText(lastMsg);
			telegram.sendMessageAll(task + '\n' + message);
		}

		if (wait) setTimeout(waitingForAnswer, 5000, msgId, task);
	});
}

function startWatch() {
	vk.getPosts(sourceVkId, 3).then(function(posts) {
		posts.forEach(function(post) {
			if (post.date > lastTime) {
				const codeWord = post.text && post.text.length > 0 && searchCodeWord(post.text);
				if (codeWord) {
					vk.sendMessage(sourceVkId, codeWord).then(function(msgId) {
						wait = true;
						waitingForAnswer(msgId, post.text);
					});
				}
			}
			lastTime = Math.max(post.date, lastTime);
		});

	});
}

module.exports = {
	init: function(t, v) {
		telegram = t;
		vk = v;
		setInterval(startWatch, 60000);
	}
};