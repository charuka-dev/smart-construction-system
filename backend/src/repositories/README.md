# Repositories

Data-access layer. One file per table/aggregate, exporting functions
that take the mysql pool from `config/db.js` and return plain objects.
Services call repositories; controllers and routes do not.
