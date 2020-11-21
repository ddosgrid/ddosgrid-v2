var N = 10
var result = './output.csv'
var args = process.argv.slice(2);
if(! args[0]) {
  console.log("No arguments given, using 'output.csv' and '10'")
  console.log("Usage: ./createPlot ./path/to/csv numberOfRounds ")
  console.log("Example: ./createPlot ./results/datasetxy/output.csv 10")
}
if(args[0] && !args[1]) {
  result = args[0]
}
if(args[1]) {
  result = args[0]
  N = Number(args[1])
}
console.log(`Creating plot for "${result}" with "${N}" rounds`)

var fs = require('fs')
var file = fs.readFileSync(result, 'utf-8')
var lines = file.split('\n')
lines.shift()

duration_filesize_plot(lines)
console.log('\n####################################\n')
memusage_filesize_plot(lines)

function duration_filesize_plot (lines) {
  // For file sizes on X axis
  //

  var xVals = []
  var yVals = []

  var coordinates = lines.map(function (l) {
    if(l) {
      var cells = l.split(',')
      var x = cells[1] / 1000 / 1000
      var y = cells[N+2] / 1000
      xVals.push(x)
      yVals.push(y)
      return `(${x},${y})`
    }
  })
  var output = coordinates.join('')

  var xmax = Math.max(...xVals)
  var m = Math.ceil(Math.log10(xmax))
  var xceil = Math.pow(10, m)

  var ymax = Math.max(...yVals)
  m = Math.ceil(Math.log10(ymax))
  var yceil = Math.pow(10, m)

  console.log(`
  \\begin{tikzpicture}
  \\begin{axis}[
      enlargelimits=false,
      ylabel={TBD},
      xlabel={TBD},
      xmin=0, xmax=${xceil},
      ymin=0, ymax=${yceil},
      xtick={${xceil * 0.25}, ${xceil * 0.5}, ${xceil * 0.75}, ${xceil}},
      ytick={0, ${yceil * 0.25}, ${yceil * 0.5}, ${yceil * 0.75}, ${yceil}},
  ]
  \\addplot+[
      color=black,
      only marks,
      mark=x,
      mark size=2.9pt]
      coordinates {
        ${output}
      };
  \\end{axis}
  \\end{tikzpicture}
  `)
}

function memusage_filesize_plot (lines) {
  var xVals = []
  var yVals = []
  var coordinates = lines.map(function (l) {
    if(l) {
      var cells = l.split(',')
      var x = cells[1] / 1000 / 1000 / 1000
      xVals.push(x)
      var y = cells[N+3].split('MB')[0]
      yVals.push(y)
      return `(${x},${y})`
    }
  })

  var output = coordinates.join('')

  var xmax = Math.max(...xVals)
  var m = Math.ceil(Math.log10(xmax))
  var xceil = Math.pow(10, m)

  var ymax = Math.max(...yVals)
  m = Math.ceil(Math.log10(ymax))
  var yceil = Math.pow(10, m)


  console.log(`
  \\begin{tikzpicture}
  \\begin{axis}[
      enlargelimits=false,
      ylabel={TBD},
      xlabel={TBD},
      xmin=0, xmax=${xceil},
      ymin=0, ymax=${yceil},
      xtick={${xceil * 0.25}, ${xceil * 0.5}, ${xceil * 0.75}, ${xceil}},
      ytick={0, ${yceil * 0.25}, ${yceil * 0.5}, ${yceil * 0.75}, ${yceil}},
  ]
  \\addplot+[
      color=black,
      only marks,
      mark=x,
      mark size=2.9pt]
      coordinates {
      ${output}
      };
  \\end{axis}
  \\end{tikzpicture}
  `)

}
