-- mariadb --user=test_user --password=password -D fp < facial-paralysis.sql

DROP TABLE IF EXISTS user_aliases;
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
    ('jcarson', 'password', 'ADMIN'),
    ('jmiranda', 'password', 'ADMIN'),
    ('anon1', 'password', 'USER')
;

CREATE TABLE sent_files (
    id INT AUTO_INCREMENT,
    url VARCHAR(255),
    user_id INT,
    CONSTRAINT PRIMARY KEY (id),
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE user_aliases (
    id INT AUTO_INCREMENT,
    user_primary INT,
    user_alias INT,
    CONSTRAINT PRIMARY KEY (id),
    CONSTRAINT FOREIGN KEY (user_primary), REFERENCES users (id),
    CONSTRAINT FOREIGN KEY (user_alias), REFERENCES users (id)
);

SELECT * FROM users;
