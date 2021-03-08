import pandas as pd
import sys

dataset = pd.read_csv(sys.argv[1])
counts = dataset['is_attack'].value_counts()

print(counts)
