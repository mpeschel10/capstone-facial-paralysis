-- mariadb --user=test_user --password=password -D fp < facial-paralysis.sql

DROP TABLE IF EXISTS messages;
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
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    note TEXT,
    user_id INT,
    date BIGINT,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note TEXT,
    sender_id INT,
    recipient_id INT,
    status SET('SENT', 'DELIVERED'),
    CONSTRAINT FOREIGN KEY (sender_id) REFERENCES users (id),
    CONSTRAINT FOREIGN KEY (recipient_id) REFERENCES users (id)
);

CREATE TABLE aliases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primary_id INT,
    alias_id INT,
    CONSTRAINT FOREIGN KEY (primary_id) REFERENCES users (id),
    CONSTRAINT FOREIGN KEY (alias_id) REFERENCES users (id)
);

SELECT * FROM users;
