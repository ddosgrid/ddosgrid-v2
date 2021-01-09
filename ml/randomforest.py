#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd

def main():
    dataset = pd.read_csv(sys.argv[1])
    X = dataset.iloc[:, 2:-2].values
    y = dataset.iloc[:, -2].values

    from sklearn.ensemble import RandomForestClassifier
    classifier = RandomForestClassifier(n_estimators = 10, criterion = 'entropy')
    classifier.fit(X, y)

    toPredict = pd.read_csv(sys.argv[2])
    toPredictX = toPredict.iloc[:, 2:-1].values

    toPredicty = classifier.predict(toPredictX)
    # print(len(toPredicty))

    for value in toPredicty:
        print(value)

    toPredict['is_attack'] = toPredicty
    pd.DataFrame(toPredict).to_csv(sys.argv[2], index=False)

main()
# todo write to csv

# pd.DataFrame(toPredicty).to_csv("/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/predicted.csv")

# print(pd.read_csv('/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/predicted.csv'))
