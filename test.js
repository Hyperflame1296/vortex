let { VortexInstance } = require('./index.js');
let v = new VortexInstance();
v.loadSettings();
v.interpret('./example/fullExample.vx');
v.highlight('./example/fullExample.vx');