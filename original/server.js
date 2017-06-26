var express = require('express');
var multer = require('multer');
var fs = require('mz/fs');
var winston = require('winston');
var htk = require('./htk');

var upload = multer({ dest: 'uploads/' });

var app = express();

app.post('/upload', upload.single('file'), (req, res) => {
	winston.info('received file', req.file);
	var file = req.file;
	if(file.mimetype != 'audio/wav') {
		fs.unlink(file.path).then(() => {
			res.send({ status: 'error', message: 'bad file' });
			return;
		});
		return;
	}
	var id = req.file.filename;
	fs.rename(file.path, 'data/' + id + '.wav')
	.then(() => {
		return htk.recognize(id);
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
