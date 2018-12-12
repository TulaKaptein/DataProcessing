#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478

"""
This script converts a .csv file to a .JSON file
"""

import pandas as pd

INPUT_CSV = "International_data (1).csv"
OUTPUT = "CoalConsumption.json"

df = pd.read_csv(INPUT_CSV, sep=',', na_values=['', '--'], header=4)
# df['Life Expectancy'] = df['Life Expectancy'].str.replace(',', '.')
df.set_index('Country', inplace=True)
df.to_json(OUTPUT, orient='index')
