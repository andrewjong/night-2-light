let { shelljs } = require("shelljs");

function pyRun(input, output_dir, ratio = 100, callback) {
  console.log('Machine Learning inference started')

  if (callback === undefined) {
    callback = () => console.log("Inference done!")
  }

  if (shelljs.exec(
    `../inference_Sony/inference_Sony ${input} -o ${output_dir} -r ${ratio}`,
    callback = callback
  ).code !== 0) {
    console.error("Inference script failed!")
  }
}
