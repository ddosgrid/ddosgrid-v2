# Performance Testing

## Usage
To run this, the `miner` package needs to be setup properly.
Simply pass a folder that contains PCAP files (or subfolders with pcaps), a project name and the number of iterations for each file.
For example:
```bash
./evaluation.sh "/path/to/some/dataset/**/*.pcap" namexy 30 
```
This will analyse each PCAP file in any subfolder for 30 iterations. Then, a CSV in ./results/namexy/output.csv is created:
```csv
File Name, File Size, Response Time 1, ..., Response Time 30, Average Response Time, Memory Usage
file-1.pcap, 100000, 100, ..., 120, 110, 50MB
```

To create a a pgfplots from the results one may use the nodejs script:
```javascript
node create_Latex_Charts.js ./results/namexy/output.csv 30
```
