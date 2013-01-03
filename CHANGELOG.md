v0.0.2
======

- `api.getBookByISBN` can now be called with a string instead of an object.
  `api.getBookByISBN('…')` is a shortcut for `api.getBookByISBN({query:'…'})`.
- `BooksList` is now an Array-like, the `.books` attribute has been removed.
- `BooksList#fetchAll` has been added, to fetch all books.


Minor changes
-------------

- ISBN & EAN codes’ hyphens are now stripped
- Encoding issue (#3) has been resolved, no more '�' in strings
- All attributes are now correctly parsed (#1)


v0.0.1
======

First version.
