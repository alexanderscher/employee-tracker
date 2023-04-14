INSERT INTO departments (name)
VALUES 
('IT Operations Department'),
('Software Development Department'),
('Information Security Department'),
('Data Analytics Department');

INSERT INTO roles (title, salary, department_id)
VALUES 
('Network Engineer', 100000, 1),
('Software Developer/Engineer:', 150000, 2),
('Project Manager', 125000, 2),
('Information Security Analyst', 80000, 3),
('Data Analyst', 200000, 4),
('Data Scientist', 145000.00, 4);


INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
('Jasmine', 'Nguyen', 1, 1),
('Nathan', 'Brown', 2, 1),
('Bradley', 'Parker', 3, 2), 
('Olivia', 'Bennett', 4, 2),
('Isaac', 'Turner', 5, 3), 
('Emma', 'Sullivan', 6, 3),



