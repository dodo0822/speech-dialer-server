var cp = require('child_process');
var fs = require('mz/fs');
var child_process = require('mz/child_process');
var winston = require('winston');

var config = require('./config');

module.exports = {
	recognize: (id) => {
		winston.info('starting to recognize ' + id);
		return fs.writeFile(__dirname + '/data/' + id + '_copy.scp', 'data/' + id + '.wav data/' + id + '.mfc')
		.then(() => {
			return fs.writeFile(__dirname + '/data/' + id + '.scp', 'data/' + id + '.mfc');
		})
		.then(() => {
			return child_process.execFile(config.htkDir + '/HCopy', [
				'-C', 'lib/hcopy.cfg',
				'-S', 'data/' + id + '_copy.scp'
			], {
				cwd: __dirname
			});
		})
		.then(() => {
			winston.info(id + ' feature extration complete');
			return child_process.execFile(config.htkDir + '/HVite', [
				'-H', 'hmm/macros',
				'-H', 'hmm/models',
				'-S', 'data/' + id + '.scp',
				'-C', 'lib/config.cfg',
				'-w', 'lib/wdnet_sp',
				'-l', "'*'",
				'-i', 'data/' + id + '.mlf',
				'-p', '0.0',
				'-s', '0.0',
				'lib/dict', 'lib/models_sp.lst'
			], {
				cwd: __dirname
			});
		})
		.then(() => {
			winston.info(id + ' Viterbi search complete');
			return fs.readFile(__dirname + '/data/' + id + '.mlf');
		})
		.then((str) => {
			var lines = str.toString().split('\n');
			var result = [];
			for(var i = 2; i < lines.length-1; ++i) {
				var name = lines[i].split(' ')[2];
				if(name == 'ling') result.push('0');
				else if(name == 'yi') result.push('1');
				else if(name == 'er') result.push('2');
				else if(name == 'san') result.push('3');
				else if(name == 'si') result.push('4');
				else if(name == 'wu') result.push('5');
				else if(name == 'liu') result.push('6');
				else if(name == 'qi') result.push('7');
				else if(name == 'ba') result.push('8');
				else if(name == 'jiu') result.push('9');
			}
			return result;
		});
	}
};


