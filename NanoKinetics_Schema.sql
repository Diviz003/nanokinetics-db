CREATE DATABASE IF NOT EXISTS NanoKineticsDB;
USE NanoKineticsDB;

CREATE TABLE IF NOT EXISTS NANOZYMES (
    NanozymeID INT AUTO_INCREMENT PRIMARY KEY,
    Material VARCHAR(100) NOT NULL,
    Shape VARCHAR(50) NOT NULL,
    StructureSource ENUM('PDB', 'AlphaFold', 'None') DEFAULT 'None',
    StructureID VARCHAR(50) DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS SUBSTRATES (
    SubstrateID INT AUTO_INCREMENT PRIMARY KEY,
    SubstrateName VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS KINETIC_ASSAYS (
    AssayID INT AUTO_INCREMENT PRIMARY KEY,
    NanozymeID INT NOT NULL,
    SubstrateID INT NOT NULL,
    Vmax DECIMAL(10,4) NOT NULL CHECK (Vmax > 0),
    Km DECIMAL(10,4) NOT NULL CHECK (Km > 0),
    pH_Level DECIMAL(4,2) NOT NULL CHECK (pH_Level >= 0 AND pH_Level <= 14),
    Temp_C DECIMAL(5,2) NOT NULL CHECK (Temp_C >= -273.15),
    ApprovalStatus ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    SubmissionDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (NanozymeID) REFERENCES NANOZYMES(NanozymeID) ON DELETE CASCADE,
    FOREIGN KEY (SubstrateID) REFERENCES SUBSTRATES(SubstrateID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CURATION_LOGS (
    LogID INT AUTO_INCREMENT PRIMARY KEY,
    AssayID INT NOT NULL,
    LogTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    AlertMessage VARCHAR(255) NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (AssayID) REFERENCES KINETIC_ASSAYS(AssayID) ON DELETE CASCADE
);

DELIMITER //
CREATE TRIGGER NotifyNewSubmission
AFTER INSERT ON KINETIC_ASSAYS
FOR EACH ROW
BEGIN
    IF NEW.ApprovalStatus = 'Pending' THEN
        INSERT INTO CURATION_LOGS (AssayID, AlertMessage)
        VALUES (NEW.AssayID, CONCAT('Action Required: New kinetic data submitted for Assay ID ', NEW.AssayID));
    END IF;
END;
//
DELIMITER ;

INSERT IGNORE INTO SUBSTRATES (SubstrateName) VALUES 
('TMB'), ('DAB'), ('H2O2');

INSERT INTO NANOZYMES (Material, Shape, StructureSource, StructureID) VALUES 
('Fe3O4', 'Spherical', 'PDB', '1A2B'),
('CeO2', 'Nanorod', 'AlphaFold', 'AF-P12345-F1'),
('Au', 'Nanocluster', 'None', NULL),
('Pt', 'Nanowire', 'PDB', '4XYZ'),
('MoS2', 'Nanosheet', 'None', NULL),
('VN', 'Nanowire', 'AlphaFold', 'AF-Q98765-F1'),
('Co3O4', 'Nanoparticle', 'PDB', '2C3D'),
('MnO2', 'Nanosheet', 'None', NULL),
('Ag', 'Nanosphere', 'PDB', '5E6F'),
('CuS', 'Nanoflake', 'None', NULL),
('V2O5', 'Nanowire', 'AlphaFold', 'AF-R45678-F1'),
('Pd', 'Nanocube', 'PDB', '7G8H'),
('FeS', 'Nanoparticle', 'None', NULL),
('NiO', 'Nanosheet', 'PDB', '9I0J');

INSERT INTO KINETIC_ASSAYS (NanozymeID, SubstrateID, Vmax, Km, pH_Level, Temp_C, ApprovalStatus) VALUES 
(1, 1, 0.0870, 0.1540, 3.6, 25.0, 'Approved'),
(1, 3, 0.0540, 1.2000, 3.6, 25.0, 'Approved'),
(2, 1, 0.1120, 0.0980, 4.0, 30.0, 'Approved'),
(2, 2, 0.0950, 0.1100, 4.0, 30.0, 'Approved'),
(3, 1, 0.2010, 0.0500, 4.5, 37.0, 'Approved'),
(3, 3, 0.1800, 0.0650, 4.5, 37.0, 'Approved'),
(4, 1, 0.3100, 0.0210, 3.0, 25.0, 'Approved'),
(4, 2, 0.2900, 0.0250, 3.0, 25.0, 'Approved'),
(5, 1, 0.0750, 0.1800, 4.2, 25.0, 'Approved'),
(5, 3, 0.0600, 1.5000, 4.2, 25.0, 'Approved'),
(6, 1, 0.1300, 0.0850, 4.0, 40.0, 'Approved'),
(7, 2, 0.0920, 0.1400, 3.5, 25.0, 'Approved'),
(8, 1, 0.1450, 0.0900, 4.0, 25.0, 'Approved'),
(8, 3, 0.1250, 0.8500, 4.0, 25.0, 'Approved'),
(9, 1, 0.1850, 0.0600, 4.5, 35.0, 'Approved'),
(10, 2, 0.0880, 0.1600, 3.8, 25.0, 'Approved'),
(11, 1, 0.1150, 0.1050, 4.0, 30.0, 'Approved'),
(12, 3, 0.2800, 0.0300, 3.5, 25.0, 'Approved'),
(13, 1, 0.0700, 0.1900, 4.0, 25.0, 'Approved'),
(14, 2, 0.0650, 0.2100, 4.5, 40.0, 'Approved');

INSERT INTO KINETIC_ASSAYS (NanozymeID, SubstrateID, Vmax, Km, pH_Level, Temp_C, ApprovalStatus) 
VALUES (1, 2, 0.0999, 0.1234, 4.0, 25.0, 'Pending');