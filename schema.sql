DROP TABLE IF EXISTS packages;
CREATE TABLE packages (
    name TEXT NOT NULL,
    arch TEXT NOT NULL,
    branch TEXT NOT NULL,
    repo TEXT NOT NULL,
    version TEXT NOT NULL,
    description TEXT NOT NULL,
    builddate INTEGER NOT NULL,
    PRIMARY KEY (`name`, `arch`, `branch`)
);
