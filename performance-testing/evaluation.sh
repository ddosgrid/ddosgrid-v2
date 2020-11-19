#!/bin/bash
# Check input arguments
if [[ "$1" = "" ]]; then
  echo "Please supply a folder that contains PCAP files"
  echo "Usage: eval.sh datasetdirector evaluationname [nrofrounds=30]"
  echo "Example: eval.sh ./**/*.pcap iotevaluation 30"
  exit 1
fi

if [[ "$2" = "" ]]; then
  echo "Please supply the name of this evaluation"
  exit 1
fi

nrPcaps=$(ls -l $1 | grep "\.pcap" | wc -l)
if [[ "$nrPcaps" = 0 ]]; then
  echo "No PCAP files were found in $1"
  exit 1
fi

echo "$nrPcaps PCAP files were found in your dataset"

if [[ "$3" != "" ]]; then
    rounds="$3"
else
    rounds=30
fi

dataset=$1
name=$2
echo "Evaluation started."
echo "analyzing $1 as $2 and analysing each file for $rounds rounds"

mkdir -p results/$name

# Print header
echo -n "File Name, File Size," > results/$name/output.csv
for i in `seq $rounds`; do echo -n  Response Time $i, >> results/$name/output.csv; done
echo "Average Response Time" >> results/$name/output.csv
for entry in $dataset
do
  echo "Starting..  $(basename $entry)"
  # file, size, responseiter0, responseiter1, responseiter2
  mysize=$(find "$entry" -printf "%s")
  echo -n "$(basename $entry),${mysize}," >> results/$name/output.csv

  # Start analysing each file or rounds times
  total=0
  for i in `seq $rounds`;
  do
    ts=$(date +%s%N)
    node ../miner/index.js pcap_path=$entry>/dev/null
    elapsed=$((($(date +%s%N) - $ts)/1000000))
    total=$(expr $total + $elapsed)
    echo -n "$elapsed," >> results/$name/output.csv

    prog=$(expr $i \* 100 / $rounds)
    progbar=""
    for j in `seq $prog`; do progbar="=$progbar"; done
    progbar="$progbar>"
    for j in `seq $prog 99`; do progbar="$progbar-"; done
    echo -ne "$progbar ($i/$rounds)\r"
  done
  echo -ne '\n'
  echo $(expr $total / $i) >> results/$name/output.csv
done

