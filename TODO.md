* Cache entities objects, to avoid fetching twice the same page
* By default, don't fetch sub-entities (e.g. books of a publisher),
  and add an option to prefetch them, like now
* Add `api` module tests
* Arrays of entities should have a special `.fetchAll` method with a callback
  called only when all entities have been fetched.
* Add the docs in the project wiki
