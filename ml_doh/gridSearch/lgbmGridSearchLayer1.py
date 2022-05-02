import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import GridSearchCV

label_encoder = LabelEncoder()

# define dataset for layer 1
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

X = tsl1.iloc[:, 1:].values

# LGBM can only handle integers -> turn all the values in TLS1 into integers
for x in X:
    x = label_encoder.fit_transform(x)

y = label_encoder.fit_transform(tsl1.iloc[:, 0].values)

# tuned parameters
# do not run all at once!!!
tunedParameters = [
    {"max_depth": [6, 7, 8, 9],
     "num_leaves": [5, 8, 9, 10, 11, 12, 15, 20, 30, 40, 50, 100],
     "min_child_samples": [10, 30, 50, 70, 100, 130, 140, 145, 147, 149, 150, 151, 152, 153, 155, 160, 170, 200, 250],
     "boosting_type": ["gbdt", "dart"],
     "max_bin": [200, 230, 240, 245, 250, 251, 252, 253, 254, 255],
     "learning rate": [0.05, 0.1, 0.15, 0.18, 0.19, 0.2, 0.21, 0.22, 0.25]
     }
]

# evaluate the classifier
classifierLayer1 = LGBMClassifier(max_depth=8, num_leaves=10, min_child_samplesf=151,
                                  boosting_type="gbdt", max_bin=255, learning_rate=0.2)
gridSearch = GridSearchCV(classifierLayer1, tunedParameters)

layer1Model = gridSearch.fit(X=X, y=y)
print(layer1Model.best_params_, layer1Model.best_score_)
