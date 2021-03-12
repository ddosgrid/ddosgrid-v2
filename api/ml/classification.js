const child_process = require('child_process')
const fork = child_process.fork
const spawn = child_process.spawn
const path = require('path')
const fs = require('fs')

async function machineLearning (csvPath, algorithm, userid) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve(`../ml/algorithms/${algorithm}.py`)
    var trainingData = path.resolve('../ml/trainingdata/' + userid + '-training.csv')
    var inputPath = path.resolve(csvPath)

    var resultArray = []

    const python = spawn('python', [program, trainingData, csvPath]);
    python.stdout.on('data', function (data) {

     var splitString = data.toString().split("\n")
     var splitIntChunk = splitString.map(elem => parseInt(elem))
     resultArray = resultArray.concat(splitIntChunk)
    });
    python.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data.toString())
    });
    python.on('exit', (code) => {
      console.log(`child process close all stdio with code ${code}`);
      // console.log(resultArray);
      resolve(resultArray)
    });
  })
}

//check if traning.csv exists, if not, copy from trainingtemplate.csv
async function checkAndPrepareTrainingFile(userid) {
  return new Promise(function(resolve, reject) {
    var training = path.resolve('../ml/trainingdata/' + userid + '-training.csv')
    try {
      fs.statSync(training)
    } catch (e) {
      console.error(e);
      fs.copyFile(path.resolve('../ml/trainingtemplate.csv'), path.resolve('../ml/trainingdata/' + userid + '-training.csv'), function (err) {
        reject(err)
      })
      resolve()
    }
    resolve()
  });
}

async function resetTrainingFile(userid) {
  return new Promise(function(resolve, reject) {
    fs.copyFile(path.resolve('../ml/trainingtemplate.csv'), path.resolve('../ml/trainingdata/' + userid + '-training.csv'), function (err) {
      reject(err)
    })
    resolve()
  });
}

async function getModelStats(userid) {
  await checkAndPrepareTrainingFile(userid)

  return new Promise(function(resolve, reject) {
    fs.stat('../ml/trainingdata/' + userid + '-training.csv', function (err, stats) {
      if (err) {
        reject(err)
      } else {
        resolve(stats)
      }
    });
  });
}

async function addToModel (csvPath, id, userid) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../ml/helper/addtomodel.py')
    var trainingData = path.resolve('../ml/trainingdata/' + userid + '-training.csv')
    var inputPath = path.resolve(csvPath)

    const python = spawn('python', [program, trainingData, csvPath, id]);
    python.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data.toString())
    });
    python.on('exit', (code) => {
      console.log(`model addition child process close all stdio with code ${code}`);
      // console.log(resultArray);
      resolve()
    });
  })
}

async function removeFromModel (id, userid) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../ml/helper/removefrommodel.py')
    var trainingData = path.resolve('../ml/trainingdata/' + userid + '-training.csv')

    const python = spawn('python', [program, trainingData, id]);
    python.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data.toString())
    });
    python.on('exit', (code) => {
      console.log(`model subtraction child process close all stdio with code ${code}`);
      // console.log(resultArray);
      resolve()
    });
  })
}

async function countFileLines(userid){
  return new Promise((resolve, reject) => {
  let lineCount = 0;
  fs.createReadStream('../ml/trainingdata/' + userid + '-training.csv')
    .on("data", (buffer) => {
      let idx = -1;
      lineCount--; // Because the loop will run once for idx=-1
      do {
        idx = buffer.indexOf(10, idx+1);
        lineCount++;
      } while (idx !== -1);
    }).on("end", () => {
      resolve(lineCount);
    }).on("error", reject);
  });
};

async function getModelDistribution(userid) {
  return new Promise((resolve, reject) => {
    var program = path.resolve('../ml/helper/modeldistribution.py')
    var trainingData = path.resolve('../ml/trainingdata/' + userid + '-training.csv')
    var returnData = ""
    const python = spawn('python', [program, trainingData]);
    python.stdout.on('data', function (data) {
      returnData += data.toString()
    });
    python.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data.toString())
    });
    python.on('exit', (code) => {
      console.log(`model distribution child process close all stdio with code ${code}`);
      var result = {}
      var data = []
      var labels = []
      var lines = returnData.split('\n')
      lines.pop()
      lines.pop()

      for (var line of lines) {
        values = line.split(' ')
        var label = values[0]
        for (var i = 1; i < values.length; i++) {
          if (values[i] !== '') {
            var value = values[i]
          }
        }
        data.push(value)
        labels.push(label)
      }
      result.data = data
      result.labels = labels

      resolve(result)
    });
  });
}

async function runEvaluation (id, userid) {
  return new Promise(function (resolve, reject) {
    var program = path.resolve('../ml/evaluation/metrics/' + id + '_eval.py')
    var trainingData = path.resolve('../ml/trainingdata/' + userid + '-training.csv')
    var returnData = ""
    const python = spawn('python', [program, trainingData]);
    python.stdout.on('data', function (data) {
      returnData += data
    });
    python.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
      reject(data.toString())
    });
    python.on('exit', (code) => {
      console.log(`model evaluation child process close all stdio with code ${code}`);
      // console.log(resultArray);
      resolve(returnData)
    });
  })
}

module.exports = { machineLearning, addToModel, removeFromModel, checkAndPrepareTrainingFile, resetTrainingFile, getModelStats, countFileLines, runEvaluation, getModelDistribution }
