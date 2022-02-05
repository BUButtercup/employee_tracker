INSERT INTO department (name)
VALUES  ('Admin'),
        ('Garden Shop'),
        ('Nursery Center'),
        ('Education');

INSERT INTO subdept (name, department_id)
VALUES  ('Gift Shop', 2),
        ('Hard Goods', 2),
        ('Annuals/Perennials', 3),
        ('Trees/Shrubs', 3),
        ('Water Features/Houseplants', 3);

        

INSERT INTO role (title, salary, department_id)
VALUES  ('Owner', 150000.00, 1),
        ('Financial Officer', 80000.00, 1),
        ('Manager', 80000.00, 1),
        ('Cashier', 20.00, 2),
        ('Yard Crew', 15.00, 2),
        ('Horticulturist', 35.00, 3),
        ('Seasonal Nursery Staff', 15.00, 3),
        ('Education Coordinator', 70000.00, 4);

INSERT INTO employee (first_name, last_name, role_id, subdept_id, manager_id)
VALUES  ('Brad', 'Joules', 1, null, null),
    ('Paula', 'Davidson', 2, null, 1),
    ('Steve', 'Smith', 3, 1, 1),
    ('Cecilia', 'Hernandez', 3, 2, 1),
    ('Daisy', 'Green', 3, 3, 1),
    ('Haw', 'Thorne', 3, 4, 1),
    ('Anbessa', 'Omer', 3, 5, 1),
    ('Malee', 'Saetang', 4, 1, 3),
    ('Stephanie','Cruz',4,1,3),
    ('Deion','de Beauvoir',4,1,3),
    ('Phoebe','Jones',4,1,3),
    ('Syed','Amin',5,2,4),
    ('Chris','Freddrickson',5,2,4),
    ('Anders','Karlsson',5,2,4),
    ('Ben','Andersen',5,2,4),
    ('Liam','Walsh',6,3,5),
    ('Prana','Singh',6,3,5),
    ('Felix','de la Cruz',6,4,6),
    ('Bly','George',6,4,6),
    ('Aaliyah','Smith',6,5,7),
    ('Jerome','Santos',6,5,7),
    ('Daniela','Ortiz',7,3,5),
    ('Brooklyn','Hughes',7,3,5),
    ('Ju','Lee',7,3,5),
    ('Burt','Stevenson',7,3,5),
    ('Mandee','Tori',8,null,1);

