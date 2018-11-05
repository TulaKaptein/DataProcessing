#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

with open(INPUT_CSV, newline='') as input_file:
    reader = csv.DictReader(input_file)

    # save the ratings of movies per year in data_dict
    for row in reader:
        data_dict[row['Year']].append(row['Rating'])
    years = []
    averages = []
    for key in data_dict:
        years.append(int(key))
    print(years)
    for key in data_dict:
        total = 0
        ratings = 0
        for value in data_dict[key]:
            total += float(value)
            ratings += 1
        average = round(total/ratings, 2)
        averages.append(average)
    print(averages)
    lines = plt.plot(years, averages, color='r', linewidth=2.0)
    plt.ylabel('average rating')
    plt.xlabel('year')
    plt.axis([2007, 2018, 8.0, 9.0])

if __name__ == "__main__":
    plt.show()
