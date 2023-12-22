INSERT INTO user
    (username, password, kind)
VALUES
    -- Note: For testing purposes, all passwords are of the form `${username}_password`
    ('mpeschel', '$argon2i$v=19$m=4096,t=3,p=1$NHw/0ZeoRZO5GwggL21mgg$+oXcnUw4TMxLAT6rPTlC3oiAWkD0Co64g/ZEUB4B/eQ', 'ADMIN'),
    ('jcarson', '$argon2i$v=19$m=4096,t=3,p=1$u6r+MEs7iQLedI1yCxyRVw$pTXhegqH2h6h+SizPv2g+XX88P+rzI/L0uEO4/bV4u0', 'ADMIN'),
    ('jmiranda', '$argon2i$v=19$m=4096,t=3,p=1$HFnkzewbwRniD1URIht5Pg$g/1yi0iLc7Hnn27iruEsk23YCyrPr96D1IU0cMUFwMA', 'ADMIN'),
    
    ('ghouse', '$argon2i$v=19$m=4096,t=3,p=1$BBM36GrNXs+iAYYX82+rHA$5OQoQI+ZN7+kEVq+W9JOBH+EtoFtLVTJyZ0rBVxNR8Q', 'ADMIN'),

    ('radler', '$argon2i$v=19$m=4096,t=3,p=1$rgAnHrvktStdWbm1vXMETg$hSEsUGpgXRElc/ML+Z2UPdx0JDLJ4VRnNHRDE/+OAis', 'USER'),
    ('rculling', '$argon2i$v=19$m=4096,t=3,p=1$4vZDgpbEsvQ28tjloW77pw$Eg2jXMRakG9KMkTmCwM9mOlITmC+j/dYz3d7ST1fJlE', 'USER')
;


INSERT INTO patient
    (patient_id, clinician_id)
VALUES
    (5, 4), -- radler -> ghouse
    (6, NULL) -- rculling -> NULL
;

