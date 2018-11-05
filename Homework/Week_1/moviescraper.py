#!/usr/bin/env python
# Name: Tula Kaptein
# Student number: 11013478
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # make a list of raw data for the movies
    movies = []
    movies_raw = dom.find_all(lambda tag: tag.name == 'div' and tag.get('class') == ['lister-item-content'])
    for movie in movies_raw:
        title = movie.h3.a.string
        rating = movie.find("div", class_= "inline-block ratings-imdb-rating").strong.string
        year_released = movie.h3.find("span", class_= "lister-item-year text-muted unbold").string
        if "I" in year_released:
            year_released = year_released.split()[1]
        year_released = year_released.strip("()")
        actors_raw = movie.find_all("p")[2].find_all("a")
        actors = ""
        for link in actors_raw:
            if "adv_li_st" in link['href']:
                actor = link.string
                if actors == "":
                    actors = actor
                actors = actors + ", " + actor
        runtime = movie.find("span", class_= "runtime").string.split()[0]

        # make a list with all the info of one movie
        movie = [title, rating, year_released, actors, runtime]
        # make a list of movies
        movies.append(movie)

    return movies


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    # write the movies to the csv file
    for movie in movies:
        title = movie[0]
        rating = movie[1]
        year = movie[2]
        actors = movie[3]
        runtime = movie[4]
        writer.writerow([title, rating, year, actors, runtime])


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
