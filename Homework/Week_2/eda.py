#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478
"""
This script improves data from an input file and writes it to a JSON file.
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json

from pandas.api.types import is_numeric_dtype


# a function to remove outliers from
# https://gist.github.com/ariffyasri/70f1e9139da770cb8514998124560281
def remove_outlier(df):
    low = .05
    high = .95
    quant_df = df.quantile([low, high])
    for name in list(df.columns):
        if is_numeric_dtype(df[name]):
            df = df[(df[name] > quant_df.loc[low, name]) & (df[name] <
                    quant_df.loc[high, name])]
    return df


# hard coding input and output
INPUT_CSV = "input.csv"
OUTPUT_CSV = "data.csv"
OUTPUT = "data.json"

# make a dataframe with the important columns.
df = pd.read_csv(INPUT_CSV, na_values=['unknown', ''], usecols=['Country',
                 'Region', 'Pop. Density (per sq. mi.)',
                 'Infant mortality (per 1000 births)',
                 'GDP ($ per capita) dollars'])

# preprocess the data
df['Region'] = df['Region'].str.strip()
df['Pop. Density (per sq. mi.)'] = df['Pop. Density (per sq.\
 mi.)'].str.replace(',', '.').astype('float64')
df['GDP ($ per capita) dollars'] = df['GDP ($ per capita) dollars'].str.strip('\
dollars').astype('float64')
df['Infant mortality (per 1000 births)'] = df['Infant mortality\
 (per 1000 births)'].str.replace(',', '.').astype('float64')


# delete outliers using a function provided by
df = remove_outlier(df)

# calculate mean, median, mode and std
mean = round(df['GDP ($ per capita) dollars'].mean(), 2)
median = df['GDP ($ per capita) dollars'].median()
mode = df['GDP ($ per capita) dollars'].mode().iloc[0]
std = df['GDP ($ per capita) dollars'].std()

# produce a histogram of the 'GDP ($ per capita) dollars' column
hist = df['GDP ($ per capita) dollars'].hist()
hist.plot()
plt.show()

# calculate the Five Number Summary of the 'Infant mortality' column
data = df['Infant mortality (per 1000 births)'].tolist()
data_min = min(data)
first_quart = np.nanpercentile(data, 25)
median = np.nanpercentile(data, 50)
third_quart = np.nanpercentile(data, 75)
data_max = max(data)

# produce a boxplot of the 'Infant mortality' column
box = df[['Infant mortality (per 1000 births)']].boxplot()
box.plot()
plt.show()

df.to_csv(OUTPUT_CSV)

# write a .JSON file
df.set_index('Country', inplace=True)
df.to_json(OUTPUT, orient='index')
