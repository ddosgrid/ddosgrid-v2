#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd
from timeit import default_timer as timer

def main():
    print('Running Random Forest Evaluation 10 Times...')
    times = [0, 0, 0]
    for x in range(10):
        evaluate()
    print('Avg Total Speed')
    print(times[0] / 10)
    print('Avg Import and Model Building Speed')
    print(times[1] / 10)
    print('Avg Classification Speed')
    print(times[2] / 10)

def evaluate():
    start = timer()
    dataset = pd.read_csv(sys.argv[1])
    X = dataset.iloc[:, 2:-2].values
    y = dataset.iloc[:, -2].values

    from sklearn.ensemble import RandomForestClassifier
    classifier = RandomForestClassifier(n_estimators = 10, criterion = 'entropy')
    classifier.fit(X, y)

    middle = timer()

    toPredict = pd.read_csv(sys.argv[2])
    toPredictX = toPredict.iloc[:, 2:-1].values

    toPredicty = classifier.predict(toPredictX)

    toPredict['is_attack'] = toPredicty
    pd.DataFrame(toPredict).to_csv(sys.argv[2], index=False)

    end = timer()

    times[0] += end - start
    times[1] += middle - start
    times[2] += end - middle
