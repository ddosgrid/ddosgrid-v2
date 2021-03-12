#!/usr/bin/env python3
# coding: utf-8

import sys
import pandas as pd

def main():
    model = pd.read_csv(sys.argv[1])
    toAdd = pd.read_csv(sys.argv[2])

    # toAdd.drop_duplicates(subset=toAdd.columns.difference(['num_packets']), inplace=True)

    id = sys.argv[3]

    toAdd['dataset_id'] = id

    newModel = model.append(toAdd)

    pd.DataFrame(newModel).to_csv(sys.argv[1], index=False)
    return
main()
