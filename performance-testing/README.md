# Performance Testing

## Usage
To run this, the `miner` package needs to be setup properly.
Simply pass a folder that contains PCAP files (or subfolders with pcaps), a project name and the number of iterations for each file.
For example:
```bash
./evaluation.sh "/path/to/some/dataset/**/*.pcap" datasetname 30 
```
This will analyse each PCAP file in any subfolder for 30 iterations. Then, a CSV in ./results/"datasetname"/output.csv is created:
```csv
File Name, File Size, Response Time 1, ..., Response Time 30, Average Response Time, Memory Usage
file-1.pcap, 100000, 100, ..., 120, 110, 50MB
```
