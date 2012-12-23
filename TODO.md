* Cache entities objects, to avoid fetching twice the same page
* Make a function to parse a books list, to avoid duplicates in
  BooksList & Publisher parsers, and handle pagination
* By default, don't fetch sub-entities (e.g. books of a publisher),
  and add an option to prefetch them, like now
