USE company_db;

INSERT INTO department (name) VALUES
    ('Sales'),
    ('Engineering'),
    ('Finance'),
    ('Legal'),
    ('IT');

INSERT INTO role (title, salary, department_id) VALUES
    ('Sales Lead', 100000.00, 1),
    ('Salesperson', 80000.00, 1),
    ('Lead Engineer', 150000.00, 2),
    ('Software Engineer', 120000.00, 2),
    ('Accountant', 125000.00, 3),
    ('Legal Team Lead', 250000.00, 4),
    ('Lawyer', 190000.00, 4),
    ('Lead Software Engineer', 200000.00, 2),
    ('Lead Accountant', 170000.00, 3);
    
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES
    ('John', 'Doe', 1, NULL),
    ('Mike', 'Chan', 2, 1),
    ('Ashley', 'Rodriguez', 3, NULL),
    ('Kevin', 'Tupik', 4, 3),
    ('Malia', 'Brown', 5, NULL),
    ('Sarah', 'Lourd', 6, 5),
    ('Tom', 'Allen', 7, NULL),
    ('Sam', 'Wright', 8, 7),
    ('Joe', 'Brown', 9, NULL);