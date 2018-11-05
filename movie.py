

class Movie(object):
    def __init__(self, title, rating, year, actors, runtime):
        self.title = title
        self.rating = rating
        self.year = year
        self.actors = actors
        self.runtime = runtime
    def __str__(self):
        return (f" In {self.title} these actors play: {self.actors}.")
