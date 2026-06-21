# Migrations

Add one timestamped SQL file per schema change, e.g.
`20260621_120000_add_quality_inspections.sql`. Apply in order with
`mysql < <file>` (or a migration tool of your choice — knex, sqitch,
flyway).
