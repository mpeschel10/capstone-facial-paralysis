-- mariadb --user=test_user --password=password -D fa < facial-analytics.sql

DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS alias;
DROP TABLE IF EXISTS upload;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id INT AUTO_INCREMENT,
    username VARCHAR(255),
    password VARCHAR(8),
    kind SET('ADMIN', 'USER'),
    CONSTRAINT PRIMARY KEY (id)
);

INSERT INTO user
    (username, password, kind)
VALUES
    ('mpeschel10', 'password', 'ADMIN'),
    ('jcarson', 'password', 'ADMIN'),
    ('jmiranda', 'password', 'ADMIN'),
    ('anon1', 'password', 'USER')
;

CREATE TABLE upload (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255),
    note TEXT,
    user_id INT,
    date BIGINT,
    CONSTRAINT FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    note TEXT,
    sender_id INT,
    recipient_id INT,
    status SET('SENT', 'DELIVERED'),
    CONSTRAINT FOREIGN KEY (sender_id) REFERENCES user (id),
    CONSTRAINT FOREIGN KEY (recipient_id) REFERENCES user (id)
);

CREATE TABLE alias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    primary_id INT,
    alias_id INT UNIQUE,
    CONSTRAINT FOREIGN KEY (primary_id) REFERENCES user (id),
    CONSTRAINT FOREIGN KEY (alias_id) REFERENCES user (id)
);

INSERT INTO aliases
    (primary_id, alias_id)
VALUES
    (1, 1)
;

SELECT * FROM user;
