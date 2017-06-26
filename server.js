var express = require('express');
var multer = require('multer');
var fs = require('mz/fs');
var winston = require('winston');
var Speech = require('@google-cloud/speech');

var upload = multer({ dest: 'uploads/' });

var app = express();
const speech = Speech();

function recognize(id) {
	const request = {
		encoding: 'LINEAR16',
		languageCode: 'cmn-Hant-TW',
		sampleRateHertz: 16000
	};
	return speech.recognize(__dirname + '/data/' + id + '.pcm', request).then((results) => {
		winston.info('recognize completed for ' + id, results);
		return results[0];
	});
}

app.post('/upload', upload.single('file'), (req, res) => {
	winston.info('received file', req.file);
	var file = req.file;
	var id = req.file.filename;
	fs.rename(file.path, 'data/' + id + '.pcm')
	.then(() => {
		return recognize(id);
	})
	.then((result) => {
		res.send({ status: 'ok', result });
	})
	.catch((err) => {
		res.send({ status: 'error' });
		winston.error(err);
	});
});

app.get('/test', (req, res) => {
	res.send('<form method="POST" action="/upload" enctype="multipart/form-data"><input type="file" name="file"><input type="submit" value="Submit"></form>');
});

app.listen(8000, (err) => {
	winston.info('started');
});
