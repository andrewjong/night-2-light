const exec = require('child_process').exec;
const path = require('path');

window.fs = require('fs');
window.os = require('os');

const EXECUTABLE_HOME = `${path.resolve(__dirname)}/../../src/assets/inference_Sony/`

function pyRun(input, outDir, ratio = 100, callback) {
  console.log('Machine Learning inference started')

  if (callback === undefined) {
    callback = () => console.log("Inference done!")
  }
  console.log("__DIRNAME", path.resolve(__dirname))

  const out = path.resolve(__dirname, "..", "..", outDir)

  const cmd = `./inference_Sony ${input} -o ${out} -r ${ratio}`
  console.log(cmd)

  exec(cmd, options = { cwd: EXECUTABLE_HOME }, callback = callback);
}

module.exports = { EXECUTABLE_HOME: EXECUTABLE_HOME }