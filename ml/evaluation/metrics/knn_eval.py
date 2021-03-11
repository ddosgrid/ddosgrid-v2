#!/usr/bin/env python3
# coding: utf-8

import sys
import numpy as np
import pandas as pd

def main():
    dataset = pd.read_csv(sys.argv[1])

    dataset.drop_duplicates(subset=dataset.columns.difference(['num_packets', 'arrival_time']), inplace=True)

    X = dataset.iloc[:, 2:-2].values
    y = dataset.iloc[:, -2].values

    from sklearn.preprocessing import StandardScaler
    sc = StandardScaler()
    X = sc.fit_transform(X)

    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size = 0.2)

    from sklearn.neighbors import KNeighborsClassifier
    classifier = KNeighborsClassifier(n_neighbors = 10, metric = 'minkowski', p = 2)
    classifier.fit(X_train, y_train)

    y_pred = classifier.predict(X_test)

    from sklearn.metrics import confusion_matrix, accuracy_score, classification_report
    cm = confusion_matrix(y_test, y_pred)
    print('Unrounded Accuracy Score')
    print(accuracy_score(y_test, y_pred))
    print()
    print('Metrics Evaluation')
    target_names = ['No Attack', 'SYN Flood', 'ICMP Flood', 'UDP Flood', 'IP Sweep', 'Ping of Death', 'Port Sweep']
    print(classification_report(y_test, y_pred, zero_division=0, target_names=target_names))
    print()
    print('Confusion Matrix of Features')
    print(cm)

main()
