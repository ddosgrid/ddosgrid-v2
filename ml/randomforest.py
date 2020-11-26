#!/usr/bin/env python
# coding: utf-8

import numpy as np
import pandas as pd

dataset = pd.read_csv('/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/training.csv')
X = dataset.iloc[:, 2:-1].values
y = dataset.iloc[:, -1].values

from sklearn.ensemble import RandomForestClassifier
classifier = RandomForestClassifier(n_estimators = 10, criterion = 'entropy')
classifier.fit(X, y)

toPredict = pd.read_csv('/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/topredict.csv')
toPredictX = toPredict.iloc[:, 2:-1].values

toPredicty = classifier.predict(toPredictX)
pd.DataFrame(toPredicty).to_csv("/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/predicted.csv")

print(pd.read_csv('/home/luc/Documents/MA/ddosgrid/ddosgrid-v2/api/analysis/predicted.csv'))
