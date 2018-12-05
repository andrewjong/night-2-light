const exec = require('child_process').exec;
const path = require('path');

function pyRun(input, output_dir, ratio = 100, callback) {
  console.log('Machine Learning inference started')

  if (callback === undefined) {
    callback = () => console.log("Inference done!")
  }
  console.log("__DIRNAME", path.resolve(__dirname))

  const cmd = `${path.resolve(__dirname)}/../../src/assets/inference_Sony/inference_Sony ${input} -o ${output_dir} -r ${ratio}`
  console.log(cmd)

  exec(cmd, callback = callback);
}
