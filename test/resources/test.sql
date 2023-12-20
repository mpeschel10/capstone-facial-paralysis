INSERT INTO user
    (username, password, kind)
VALUES
    -- Note: For testing purposes, all passwords are of the form `password_${username}`
    ('mpeschel', '$argon2i$v=19$m=4096,t=3,p=1$JeRjKSUzcA98LFpg+swBRw$0Dk/r+JHIOuacj4nlyo1srgy2y7N78GOt1/xoo3gewk', 'ADMIN'),
    ('jcarson', '$argon2i$v=19$m=4096,t=3,p=1$hNX7UHhF6tb4kYCxeg4SDQ$ZrdD/f8nqrt7ieirLTMnlTFK+qPkraJnwBcakTVPVuw', 'ADMIN'),
    ('jmiranda', '$argon2i$v=19$m=4096,t=3,p=1$W9oXqyj2M57SA+waB20qOQ$zJ+5pMFtHAiyGyVA4cN62GI/qQrhCovXWlCGmOq0WEU', 'ADMIN'),
    
    ('ghouse', '$argon2i$v=19$m=4096,t=3,p=1$8WMVTQQGWNPi1N22B1TI7Q$AV9Qo/3Savj7X9vRSNCoEEC1vFr4fb0DJ1WGNUpn1Pw', 'ADMIN'),

    ('radler', '$argon2i$v=19$m=4096,t=3,p=1$0msH4hAcnsl+Km64bpITTg$SFVefeDen04DVjAx25wnax2pvQw7xS0xRZngL+t0oak', 'USER'),
    ('rculling', '$argon2i$v=19$m=4096,t=3,p=1$qPX7GiRcoLYWEdu847kVcg$tQSLg+kD8oqVeUx1qoGeQOHE7tNUZEYBfEGo116/t6o', 'USER')
;


INSERT INTO patient
    (patient_id, clinician_id)
VALUES
    (5, 4), -- radler -> ghouse
    (6, NULL) -- rculling -> NULL
;

