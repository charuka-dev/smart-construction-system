# Database

MySQL schema, seed data, and incremental migrations for BuildSync-3D.

```bash
mysql -u root -p buildsync < schema.sql
mysql -u root -p buildsync < seed.sql
# then any files under migrations/ in filename order
```

`schema.sql` and `seed.sql` here are the canonical copies. The same
files are mirrored under `backend/db/` for the backend's standalone
README; if you change one, update the other.
