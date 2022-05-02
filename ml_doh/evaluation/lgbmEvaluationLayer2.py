import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, roc_curve, auc
import matplotlib.pyplot as plt
import seaborn as sns

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
    'total_packet_length',
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

# Testing Data
testingDataset1 = pd.read_csv("../testing_data-set/testingSetEvaluationLayer2.csv")

toPredict = pd.DataFrame(columns=featureSequenceLayer2)

for feature in featureSequenceLayer2:
    toPredict[feature] = testingDataset1[feature]

X_test = toPredict.iloc[:, 1:].values

for x in X_test:
    x = label_encoder.fit_transform(x)

y_test = label_encoder.fit_transform(toPredict.iloc[:, 0].values)

# evaluate the classifier
classifierLayer2 = LGBMClassifier(max_depth=8, num_leaves=10, min_child_samples=151,
                                  boosting_type="gbdt", max_bin=255, learning_rate=0.2)
classifierLayer2.fit(X, y)

# Predict
toPredicty = classifierLayer2.predict(X_test)

print("\naccuracy_score :", accuracy_score(y_test, toPredicty))
print("\nclassification report :\n", (classification_report(y_test, toPredicty)))

# Confusion Matrix
confMat = plt.figure()
ax1 = confMat.add_subplot(1, 1, 1)
sns.heatmap(confusion_matrix(y_test, toPredicty), annot=True, fmt="d", linecolor="k", linewidths=3)
predictingProbabilities = toPredicty
fpr, tpr, thresholds = roc_curve(y_test, predictingProbabilities)
confMat.show()
confMat.savefig("plots/confusion_matrix_layer_2")

# ROC Curve
roc = plt.figure()
ax2 = roc.add_subplot(1, 1, 1)
ax2.plot(fpr, tpr, label=("Area_under the curve :", auc(fpr, tpr)), color="r")
ax2.plot([1, 0], [1, 0], linestyle="dashed", color="k")
ax2.legend(loc="best")
dataframe = pd.DataFrame(classifierLayer2.feature_importances_, featureSequenceLayer2[1:]).reset_index()
dataframe = dataframe.rename(columns={"index": "features", 0: "coefficients"})
dataframe = dataframe.sort_values(by="coefficients", ascending=False)
roc.show()
roc.savefig("plots/roc_curve_layer2.png")

# Feature Importance
feat_imp = plt.figure(figsize=(15, 8))
ax3 = sns.barplot(x="coefficients", y="features", data=dataframe, palette="husl")
for i, feature in enumerate(dataframe["coefficients"]):
    ax3.text(0.5, i+0.21, feature, weight="bold", size=9)
feat_imp.tight_layout()
feat_imp.show()
feat_imp.savefig("plots/feature_importance_layer_2.png", bbox_inches="tight")
