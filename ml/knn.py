#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd

def main():
    dataset = pd.read_csv(sys.argv[1])
    X = dataset.iloc[:, 2:-1].values
    y = dataset.iloc[:, -1].values

    #from sklearn.preprocessing import StandardScaler
    #sc = StandardScaler()
    #X = sc.fit_transform(X)

    from sklearn.neighbors import KNeighborsClassifier
    classifier = KNeighborsClassifier(n_neighbors = 10, metric = 'minkowski', p = 2)
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
