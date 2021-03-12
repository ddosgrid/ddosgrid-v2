#!/usr/bin/env python3
# coding: utf-8

import sys
import pandas as pd

def main():
    model = pd.read_csv(sys.argv[1])
    id = sys.argv[2]

    model.drop(model[model['dataset_id'] == id].index, inplace = True)
    
    pd.DataFrame(model).to_csv(sys.argv[1], index=False)
    return
main()
