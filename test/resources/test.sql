INSERT INTO user
    (username, password, kind)
VALUES
    ('mpeschel', 'password', 'ADMIN'),
    ('jcarson', 'password', 'ADMIN'),
    ('jmiranda', 'password', 'ADMIN'),
    
    ('ghouse', 'password', 'ADMIN'),

    ('radler', 'password', 'USER'),
    ('rculling', 'password', 'USER')
;

INSERT INTO patient
    (patient_id, clinician_id)
VALUES
    (5, 4), -- radler -> ghouse
    (6, NULL) -- rculling -> NULL
;

