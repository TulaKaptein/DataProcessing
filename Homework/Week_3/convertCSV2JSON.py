#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478

"""
This script converts a .csv file to a .JSON file
"""

import pandas as pd

INPUT_CSV = "lifeExpectancyAtBirth.csv"
OUTPUT = "lifeExpectancyAtBirth.json"

df = pd.read_csv(INPUT_CSV, sep=';', na_values='', usecols=['Country', 'Region',
        'Income Group', 'Year', 'Life Expectancy'])

df.to_csv("test.csv")
df.to_json(OUTPUT, orient='index')
