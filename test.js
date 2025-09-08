let { VortexInstance } = require('./index.js');
let v = new VortexInstance();
let fs = require('node:fs');
let data = fs.readFileSync('./example/main.v', 'utf8');
v.loadSettings();
v.interpret(data);
v.highlight(data);