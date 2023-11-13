-- mariadb --user=test_user --password=password -D fp < facial-paralysis.sql

DROP TABLE IF EXISTS sent_files;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT,
    username VARCHAR(255),
    password VARCHAR(8),
    kind SET('ADMIN', 'USER'),
    CONSTRAINT PRIMARY KEY (id)
);

INSERT INTO users
    (username, password, kind)
VALUES
    ('mpeschel10', 'password', 'ADMIN'),
    ('anon1', 'password', 'USER')
;

CREATE TABLE sent_files (
    id INT AUTO_INCREMENT,
    CONSTRAINT PRIMARY KEY (id)
);

SELECT * FROM users;
