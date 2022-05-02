import pandas as pd

fileName = "Benign-DoH-IEEE-Firefox.csv"

# ------------------------------------- #

# dataset = pd.read_csv(fileName)
#
# for column in dataset:
#     dataset = dataset[column].str.replace(";", ",")
#
# dataset.to_csv(fileName, index=False)
#
# print(dataset.head())

# ------------------------------------- #

# newDs = pd.read_csv(fileName)
#
# print(newDs.head())

# ------------------------------------- #

raw_dataset = pd.read_csv(fileName)

preprocessedDataset = raw_dataset.drop(raw_dataset[raw_dataset["flow_sent_rate"] == 0].index)
preprocessedDataset = raw_dataset.drop(raw_dataset[raw_dataset["flow_received_rate"] == 0].index)
preprocessedDataset = raw_dataset.drop(raw_dataset[raw_dataset["packet_length_median"] == 0].index)
preprocessedDataset = raw_dataset.drop(raw_dataset[raw_dataset["packet_time_median"] == 0].index)
preprocessedDataset = raw_dataset.drop(raw_dataset[raw_dataset["response_request_median"] == 0].index)

preprocessedDataset.to_csv(fileName, index=False)
