INSERT INTO user
    (username, password, kind)
VALUES
    -- Note: For testing purposes, all passwords are of the form `${username}_password`
    ('mpeschel', '$argon2i$v=19$m=4096,t=3,p=1$NHw/0ZeoRZO5GwggL21mgg$+oXcnUw4TMxLAT6rPTlC3oiAWkD0Co64g/ZEUB4B/eQ', 'ADMIN'), -- 1
    ('jcarson', '$argon2i$v=19$m=4096,t=3,p=1$u6r+MEs7iQLedI1yCxyRVw$pTXhegqH2h6h+SizPv2g+XX88P+rzI/L0uEO4/bV4u0', 'ADMIN'), -- 2
    ('jmiranda', '$argon2i$v=19$m=4096,t=3,p=1$HFnkzewbwRniD1URIht5Pg$g/1yi0iLc7Hnn27iruEsk23YCyrPr96D1IU0cMUFwMA', 'ADMIN'), -- 3
    
    ('ghouse', '$argon2i$v=19$m=4096,t=3,p=1$BBM36GrNXs+iAYYX82+rHA$5OQoQI+ZN7+kEVq+W9JOBH+EtoFtLVTJyZ0rBVxNR8Q', 'ADMIN'), -- 4

    ('radler', '$argon2i$v=19$m=4096,t=3,p=1$rgAnHrvktStdWbm1vXMETg$hSEsUGpgXRElc/ML+Z2UPdx0JDLJ4VRnNHRDE/+OAis', 'USER'), -- 5
    ('rculling', '$argon2i$v=19$m=4096,t=3,p=1$4vZDgpbEsvQ28tjloW77pw$Eg2jXMRakG9KMkTmCwM9mOlITmC+j/dYz3d7ST1fJlE', 'USER') -- 6
;

INSERT INTO file
    (url, owner_id, date_created)
VALUES
    ('/api/image/badger.jpg', 1, NULL), -- 1 Visible to admins and not (rculling or radler)
    ('/api/image/beaver.jpg', 2, NULL), -- 2 Visible to admins and rculling and not radler
    ('/api/image/dog.jpg', 5, NULL), -- 3 Visible to radler and admins and not rculling
    ('/api/image/owl.jpg', 5, NULL) -- 4 Visible to radler and admins and rculling
;

INSERT INTO file_visibility
    (file_id, user_id)
VALUES
    -- Owner visibility
    (1, 1), -- badger, mpeschel
    (2, 2), -- beaver, jcarson
    (3, 5), -- dog, radler
    (4, 5), -- owl, radler

    -- Sharing visibility
    (2, 6), -- beaver, rculling
    (4, 6) -- owl, rculling
    
;


INSERT INTO patient
    (patient_id, clinician_id)
VALUES
    (5, 4), -- radler -> ghouse
    (6, NULL) -- rculling -> NULL
;

