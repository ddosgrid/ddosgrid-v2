import pandas as pd

file1 = "../raw_data_sets/ieee/Benign-non-DoH-IEEE-Chrome.csv"

dataset1 = pd.read_csv(file1)

random_rows = dataset1.sample(11000)

random_rows_tsl1IEEE = random_rows.iloc[:10000]
random_rows_testDatasetLayer1IEEE = random_rows.iloc[10000:]

random_rows_tsl1IEEE.to_csv("../composed_tsls/TSL1IEEE.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer1IEEE.to_csv("../testing_data-set/IEEETestDataset.csv", index=False, mode='a', header=False)

# --------------------------------------------------- #

file2 = "../raw_data_sets/ieee/Benign-non-DoH-IEEE-Firefox.csv"

dataset2= pd.read_csv(file2)

random_rows = dataset2.sample(11000)

random_rows_tsl1IEEE = random_rows.iloc[:10000]
random_rows_testDatasetLayer1IEEE = random_rows.iloc[10000:]

random_rows_tsl1IEEE.to_csv("../composed_tsls/TSL1IEEE.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer1IEEE.to_csv("../testing_data-set/IEEETestDataset.csv", index=False, mode='a', header=False)

# --------------------------------------------------- #

file3 = "../raw_data_sets/ieee/Benign-DoH-IEEE-Chrome.csv"

dataset3= pd.read_csv(file3)

random_rows = dataset3.sample(11000)

random_rows_tsl1IEEE = random_rows.iloc[:10000]
random_rows_testDatasetLayer1IEEE = random_rows.iloc[10000:]

random_rows_tsl1IEEE.to_csv("../composed_tsls/TSL1IEEE.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer1IEEE.to_csv("../testing_data-set/IEEETestDataset.csv", index=False, mode='a', header=False)

# --------------------------------------------------- #

file4 = "../raw_data_sets/ieee/Benign-DoH-IEEE-Firefox.csv"

dataset4= pd.read_csv(file4)

random_rows = dataset4.sample(11000)

random_rows_tsl1IEEE = random_rows.iloc[:10000]
random_rows_testDatasetLayer1IEEE = random_rows.iloc[10000:]

random_rows_tsl1IEEE.to_csv("../composed_tsls/TSL1IEEE.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer1IEEE.to_csv("../testing_data-set/IEEETestDataset.csv", index=False, mode='a', header=False)
