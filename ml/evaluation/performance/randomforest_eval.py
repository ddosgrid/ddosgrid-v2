#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd
from timeit import default_timer as timer


def main():
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
    print('Full')
    print(end - start) # Time in seconds, e.g. 5.38091952400282

    print('First Half')
    print(middle - start)

    print('Second Half')
    print(end - middle)


main()
