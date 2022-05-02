import pandas as pd

dataSet = "../raw_data_sets/MaliciousDoH-iodine.csv"

dataset = pd.read_csv(dataSet)

random_rows = dataset.sample(9900)

random_rows_tsl1 = random_rows.iloc[:3000]
random_rows_tsl2 = random_rows.iloc[3000:9000]
random_rows_testDatasetLayer1 = random_rows.iloc[9000:9300]
random_rows_testDatasetLayer2 = random_rows.iloc[9300:]

random_rows_tsl1.to_csv("../composed_tsls/TSL1.csv", index=False, mode='a', header=False)
random_rows_tsl2.to_csv("../composed_tsls/TSL2.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer1.to_csv("../testing_data-set/testingSetEvaluationLayer1.csv", index=False, mode='a', header=False)
random_rows_testDatasetLayer2.to_csv("../testing_data-set/testingSetEvaluationLayer2.csv", index=False, mode='a', header=False)
