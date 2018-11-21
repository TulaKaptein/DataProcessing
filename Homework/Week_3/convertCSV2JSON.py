#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478

"""
This script converts a .csv file to a .JSON file
"""

import pandas as pd

INPUT_CSV = "data.csv"
OUTPUT = "data.json"

df = pd.read_csv(INPUT_CSV, sep=';', na_values='', usecols=['Country', 'Region',
        'Income Group', 'Year', 'Life Expectancy'])
df['Life Expectancy'] = df['Life Expectancy'].str.replace(',', '.')

df.to_json(OUTPUT, orient='index')
