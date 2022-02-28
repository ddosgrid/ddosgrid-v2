#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd
from lightgbm import LGBMClassifier
from sklearn.preprocessing import LabelEncoder

def main():

    label_encoder = LabelEncoder()


    # Layer 1

    # define dataset for layer 1
    dataset1 = pd.read_csv("../test_data/dataset.csv").drop(columns=["flow_number", "source_IP", "destination_IP", "state"])

    X1 = dataset1.iloc[:, 2:-2].values

    for x in X1:
        x = label_encoder.fit_transform(x)

    y1 = label_encoder.fit_transform(dataset1.iloc[:, -2].values)

    # evaluate the classifier
    classifier1 = LGBMClassifier()
    classifier1.fit(X1, y1)

    # Predict
    # toPredict = pd.read_csv("path to test file")
    # toPredictX = toPredict.iloc[:, 2:-1].values
    #
    # toPredicty = classifier1.predict(toPredictX)

    # for value in toPredicty:
    #     print(value)
    #
    # toPredict['DoH'] = toPredicty
    # pd.DataFrame(toPredict).to_csv(sys.argv[2], index=True)


    # Layer 2

    # define dataset for layer 2
    # dataset2 = pd.read_csv("path_to_test_dataset2").drop(columns=["flow_number", "source_IP", "destination_IP", "state"])

    # X2 = dataset2.iloc[:, 2:-2].values
    #
    # for x in X2:
    #     x = label_encoder.fit_transform(x)
    #
    # y2 = label_encoder.fit_transform(dataset2.iloc[:, -2].values)
    #
    # # evaluate the classifier
    # classifier2 = LGBMClassifier()
    # classifier2.fit(X2, y2)

    # Predict
    # toPredict = pd.read_csv("path to test file")
    # toPredictX = toPredict.iloc[:, 2:-1].values
    #
    # toPredicty = classifier2.predict(toPredictX)

    # for value in toPredicty:
    #     print(value)
    #
    # toPredict['malicious'] = toPredicty
    # pd.DataFrame(toPredict).to_csv(sys.argv[2], index=True)

main()