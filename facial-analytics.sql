-- mariadb --user=test_user --password=password -D fa < facial-analytics.sql

DROP TABLE IF EXISTS image_group;
DROP TABLE IF EXISTS file_of_message;
DROP TABLE IF EXISTS message;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS file;
DROP TABLE IF EXISTS user;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(8),
    kind SET('ADMIN', 'USER') NOT NULL
);

CREATE TABLE file (
    id INT AUTO_INCREMENT PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    -- Each file row should correspond to exactly one url,
    --  but url is not the primary key since people may want to rename files.
    owner_id INT NOT NULL,
    date_created BIGINT,
    CONSTRAINT FOREIGN KEY (owner_id) REFERENCES user (id)
);

CREATE TABLE patient (
    patient_id INT PRIMARY KEY,
    clinician_id INT,
    CONSTRAINT FOREIGN KEY (patient_id) REFERENCES user (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (clinician_id) REFERENCES user (id) ON DELETE SET NULL
    -- clinician_id can be null to represent a patient not assigned to a clinician.
    -- Can happen naturally e.g. when a clinician leaves the practice.
);

CREATE TABLE message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_id INT NOT NULL,
    to_id INT,
    status SET('DRAFT', 'SENT', 'READ') DEFAULT 'DRAFT',
    note TEXT,
    
    -- kind SET('MESSAGE'),
    -- data_json JSON,
    -- -- Eventually, I hope to incorporate "request" and "submission" functionality.
    -- -- kind and data_json will be used for that.
    -- -- data_json will hopefully be used to incorporate
    
    CONSTRAINT FOREIGN KEY (from_id) REFERENCES user (id) ON DELETE CASCADE,
    -- For the time being, delete messages from deleted users.
    -- This may run afoul of data retention polices in the future; idk.
    CONSTRAINT FOREIGN KEY (to_id) REFERENCES user (id) ON DELETE SET NULL
);

CREATE TABLE file_of_message (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message_id INT NOT NULL,
    file_id INT NOT NULL,
    CONSTRAINT FOREIGN KEY (message_id) REFERENCES message (id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (file_id) REFERENCES file (id) ON DELETE CASCADE
);

CREATE TABLE image_group (
    id INT AUTO_INCREMENT PRIMARY KEY,

    message_id INT,
    -- I expect most image_groups will be formed when people submit a set of 7
    --  as a message, hence the message_id.
    -- This will be used for back-linking: We make a report etc.,
    --  and people can click on an image set and get the associated message.
    
    -- owner_id INT,
    -- I'm not really sure if owner_id is necessary.
    -- I guess since you could have multiple files with multiple owners,
    --  you could say this is the person who grouped them?
    -- But the use case for this is when you have multiple pictures of the same person,
    --  and I assume those would all be uploaded by the same person...
    -- Could you have a clinician supply 6/7 of the pictures and then the patient
    --  do the last one at home?
    -- But like, what's the use case, anyway?
    -- The people who own the files can delete those, and there's no point grouping dead links.

    -- date_created BIGINT,
    -- Likewise, you can just look at the dates of the files themselves.
    -- It doesn't make sense to have a separate tracker. I don't know.

    at_rest INT,
    eyebrows_up INT,
    eyes_closed INT,
    nose_wrinkled INT,
    smile INT,
    lips_puckered INT,
    lower_teeth_exposed INT,
    CONSTRAINT FOREIGN KEY (at_rest) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (eyebrows_up) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (eyes_closed) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (nose_wrinkled) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (smile) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (lips_puckered) REFERENCES file (id),
    CONSTRAINT FOREIGN KEY (lower_teeth_exposed) REFERENCES file (id)
);

