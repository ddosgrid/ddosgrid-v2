import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import GridSearchCV

label_encoder = LabelEncoder()

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

X = tsl2.iloc[:, 1:].values

for x in X:
    x = label_encoder.fit_transform(x)

y = label_encoder.fit_transform(tsl2.iloc[:, 0].values)

# tuned parameters
# do not run all at once!!!
tunedParameters = [
    {"max_depth": [7, 8, 9, 10],
     "num_leaves": [10, 30, 40, 43, 44, 45, 46, 47, 48, 50, 55, 60, 70, 80, 100],
     "min_child_samples": [100, 120, 130, 136, 137, 138, 140, 141, 142, 143, 144, 145, 149, 150, 155, 160, 170, 200, 250],
     "boosting_type": ["gbdt", "dart"],
     "max_bin": [200, 230, 240, 245, 247, 250, 252, 254, 255],
     "learning rate": [0.05, 0.08, 0.09, 0.1, 0.11, 0.12, 0.15, 0.2, 0.25]
     }
]

# evaluate the classifier
classifierLayer1 = LGBMClassifier(max_depth=9, num_leaves=45, min_child_samples=142,
                                  boosting_type="gbdt", max_bin=255, learning_rate=0.1)
gridSearch = GridSearchCV(classifierLayer1, tunedParameters)

layer1Model = gridSearch.fit(X=X, y=y)
print(layer1Model.best_params_, layer1Model.best_score_)

