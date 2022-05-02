import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder
import time
from statistics import mean


label_encoder = LabelEncoder()

# defining time measure
measuredTimes = {
    "start_layer_1": [],
    "end_training_layer_1": [],
    "end_testing_layer_1": [],
    "start_layer_2": [],
    "end_training_layer_2": [],
    "end_testing_layer_2": [],
}
numberOfRuns = 10

for i in range(numberOfRuns):

    # -------------- Layer 1 -------------- #
    # define dataset for layer 1

    measuredTimes["start_layer_1"].append(time.time())

    trainingDataset1 = pd.read_csv("../composed_tsls/TSL1.csv")

    featureSequenceLayer1 = [
        'doh',
        'duration',
        'response_request_skew_from_median',
        'response_request_mode',
        'response_request_median',
        'response_request_mean',
        'packet_time_skew_from_median',
        'packet_time_mode',
        'packet_time_median',
        'packet_time_mean',
        'response_request_skew_from_mode',
        'packet_time_variation',
        'packet_length_coefficient_of_variation',
        'packet_time_standard_deviation',
        'packet_length_mode',
        'packet_length_median',
        'packet_length_mean',
        'flow_bytes_sent',
        'response_request_coefficient_of_variation',
        'packet_length_standard_deviation',
        'packet_length_variation',
        'packet_time_coefficient_of_variation',
        'flow_received_rate',
        'response_request_standard_deviation',
        'packet_length_skew_from_mode',
        'flow_bytes_received',
        'packet_length_skew_from_median',
        # New Features
        'state',
        'nr_flow_packets_sent',
        'nr_flow_packets_received',
        'nr_application_packets_sent',
        'nr_application_packets_received',
        'nr_acks_sent',
        'nr_acks_received',
        'nr_retrans_sent',
        'nr_retrans_received',
        'total_packet_length'
    ]

    # Create Training Dataset
    tsl1 = pd.DataFrame(columns=featureSequenceLayer1)

    for feature in featureSequenceLayer1:
        tsl1[feature] = trainingDataset1[feature]

    X1 = tsl1.iloc[:, 1:].values

    # LGBM can only handle integers -> turn all the values in TLS1 into integers
    for x in X1:
        x = label_encoder.fit_transform(x)

    y1 = label_encoder.fit_transform(tsl1.iloc[:, 0].values)

    # evaluate the classifier
    classifierLayer1 = LGBMClassifier(max_depth=8, num_leaves=10, min_child_samples=151,
                                      boosting_type="gbdt", max_bin=255, learning_rate=0.2)
    classifierLayer1.fit(X1, y1)

    measuredTimes["end_training_layer_1"].append(time.time())

    # Predict
    testingDataset1 = pd.read_csv("../testing_data-set/testdatasetPerformance.csv")

    toPredict = pd.DataFrame(columns=featureSequenceLayer1[1:])

    for feature in featureSequenceLayer1[1:]:
        toPredict[feature] = testingDataset1[feature]

    toPredictX1 = toPredict.iloc[:, :].values

    for x in toPredictX1:
        x = label_encoder.fit_transform(x)

    toPredicty1 = classifierLayer1.predict(toPredictX1)

    testingDataset1['DoH'] = toPredicty1
    testingDataset2 = testingDataset1.loc[testingDataset1['DoH'] == 1]
    testingDataset2.to_csv("../predicted/testdatasetAfterLayer1Performance.csv", index=False)

    measuredTimes["end_testing_layer_1"].append(time.time())

    # -------------- Layer 2 -------------- #

    measuredTimes["start_layer_2"].append(time.time())

    featureSequenceLayer2 = [
        'malicious',
        'packet_length_standard_deviation',
        'packet_length_coefficient_of_variation',
        'flow_received_rate',
        'packet_length_mean',
        'duration',
        'packet_time_skew_from_median',
        'flow_sent_rate',
        'packet_length_variation',
        'packet_time_mean',
        'packet_time_standard_deviation',
        'response_request_median',
        'packet_time_median',
        'response_request_skew_from_mode',
        'response_request_mean',
        'response_request_mode',
        'packet_time_coefficient_of_variation',
        'response_request_skew_from_median',
        'packet_time_mode',
        'flow_bytes_sent',
        'flow_bytes_received',
        'packet_length_mode',
        'response_request_coefficient_of_variation',
        'packet_length_skew_from_median',
        'packet_time_variation',
        'packet_time_skew_from_mode',
        'packet_length_median',
        'response_request_standard_deviation',
        'packet_time_variation',
        # New Features
        'state',
        'nr_flow_packets_sent',
        'nr_flow_packets_received',
        'nr_application_packets_sent',
        'nr_application_packets_received',
        'nr_acks_sent',
        'nr_acks_received',
        'nr_retrans_sent',
        'nr_retrans_received',
        'total_packet_length'
    ]

    # define training dataset for layer 2
    trainingDataset2 = pd.read_csv("../composed_tsls/TSL2.csv")

    tsl2 = pd.DataFrame(columns=featureSequenceLayer2)

    for feature in featureSequenceLayer2:
        tsl2[feature] = trainingDataset2[feature]

    X2 = tsl2.iloc[:, 1:].values

    for x in X2:
        x = label_encoder.fit_transform(x)

    y2 = label_encoder.fit_transform(tsl2.iloc[:, 0].values)

    # evaluate the classifier
    classifierLayer2 = LGBMClassifier(max_depth=9, num_leaves=45, min_child_samples=142,
                                      boosting_type="gbdt", max_bin=255, learning_rate=0.1)
    classifierLayer2.fit(X2, y2)

    measuredTimes["end_training_layer_2"].append(time.time())

    # Predict
    toPredict2 = pd.DataFrame(columns=featureSequenceLayer2[1:])

    testingDataset2 = pd.read_csv("../predicted/testdatasetAfterLayer1Performance.csv")

    for feature in featureSequenceLayer2[1:]:
        toPredict2[feature] = testingDataset2[feature]

    toPredictX2 = toPredict2.iloc[:, :].values

    for x in toPredictX2:
        x = label_encoder.fit_transform(x)

    toPredicty2 = classifierLayer2.predict(toPredictX2)

    testingDataset2['Malicious Traffic'] = toPredicty2

    maliciousTraffic = testingDataset2.loc[testingDataset2['Malicious Traffic'] == 1]
    maliciousTraffic.to_csv("../predicted/maliciousTrafficPerformance.csv", index=False)

    measuredTimes["end_testing_layer_2"].append(time.time())

l1_start_to_end_training = mean(list(np.array(measuredTimes["end_training_layer_1"]) -
                                np.array(measuredTimes["start_layer_1"])))
l1_end_training_to_end_testing = mean(list(np.array(measuredTimes["end_testing_layer_1"]) -
                                np.array(measuredTimes["end_training_layer_1"])))
l2_start_to_end_training = mean(list(np.array(measuredTimes["end_training_layer_2"]) -
                                np.array(measuredTimes["start_layer_2"])))
l2_end_training_to_end_testing = mean(list(np.array(measuredTimes["end_testing_layer_2"]) -
                                np.array(measuredTimes["end_training_layer_2"])))

print("Time measured for the Run of one Clump")
print("\nAverage Time (Layer 1) from Start to End of Training: {} Seconds"
      .format(l1_start_to_end_training))
print("\nAverage Time (Layer 1) from End of Training to End of Testing: {} Seconds"
      .format(l1_end_training_to_end_testing))
print("\nAverage Time (Layer 2) from Start to End of Training: {} Seconds"
      .format(l2_start_to_end_training))
print("\nAverage Time (Layer 2) from End of Training to End of Testing: {} Seconds"
      .format(l2_end_training_to_end_testing))
