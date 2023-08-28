//required modules
const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

// connection settings to sql database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '**password**',
    database: 'company_db'
});

// connect to mysql server and sql database
connection.connect((err) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    start();
});

// function which prompts the user for what action they should take
function start() {
    inquirer
        .prompt({
            name: 'action',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View all departments',
                'View all roles',
                'Add employee',
                'Add department',
                'Add role',
                'Update employee role',
                'Update employee manager',
                'View all employees by manager',
                'View all employees by department',
                'Exit'
            ]
        })
        // switch case to call functions based on user selection
        .then((answer) => {
            switch (answer.action) {
                case 'View all employees':
                    viewAllEmployees();
                    break;
                case 'View all departments':
                    viewAllDepartments();
                    break;
                case 'View all roles':
                    viewAllRoles();
                    break;
                case 'Add employee':
                    addEmployee();
                    break;
                case 'Add department':
                    addDepartment();
                    break;
                case 'Add role':
                    addRole();
                    break;
                case 'Update employee role':
                    updateEmployeeRole();
                    break;
                case 'Update employee manager':
                    updateEmployeeManager();
                    break;
                case 'View all employees by manager':
                    viewAllEmployeesByManager();
                    break;
                case 'View all employees by department':
                    viewAllEmployeesByDepartment();
                    break;
                    //exits out of the application
                case 'Exit':
                    connection.end();
                    break;
            }
        });
}
// functions to view all employees, departments, and roles
function viewAllEmployees() {
    //select all fields from employee table
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllDepartments() {
    //select all fields from department table
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}
function viewAllRoles() {
    //select all fields from role table
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}
// functions to add employees, departments, and roles
function addEmployee() {
    let roles = [];
    let managers = [];
    // query to get roles and managers with promises to ensure they are ran in order
    const queryAsync = (queryString) => {
        //when query is ran, return a promise
        return new Promise((resolve, reject) => {
            //query the database
            connection.query(queryString, (err, res) => {
                if (err) reject(err);
                //resolve the promise with the results
                resolve(res);
            });
        });
    };

    //call queryAsync function to get roles and managers
    queryAsync('SELECT id, title FROM role')
        .then((res) => {
            roles = res.map(({id, title}) => ({
                name: title,
                value: id
            }));
            return queryAsync('SELECT id, first_name, last_name FROM employee');
        })
        .then((res) => {
            managers = res.map(({id, first_name, last_name}) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));

    return inquirer
        .prompt([
            {
                name: 'first_name',
                type: 'input',
                message: 'What is the employee\'s first name?'
            },
            {
                name: 'last_name',
                type: 'input',
                message: 'What is the employee\'s last name?'
            },
            {
                name: 'role_id',
                type: 'list',
                message: 'What is the employee\'s role?',
                choices: roles
            },
            {
                name: 'manager_id',
                type: 'list',
                message: 'Who is the employee\'s manager?',
                choices: managers
            }
        ])
        .then((answer) => {
            return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO employee SET ?',
                {
                    first_name: answer.first_name,
                    last_name: answer.last_name,
                    role_id: answer.role_id,
                    manager_id: answer.manager_id
                },
                (err) => {
                    if (err) throw err;
                    console.log('Employee added successfully!');
                    start();
                }
            );
        });
    });
    })
    .then(() => {
        start();
    })
    .catch((err) => {
        console.error("Error adding employee!", error);
    });
}

function addDepartment() {
    inquirer
        .prompt({
            name: 'department',
            type: 'input',
            message: 'What department would you like to add?'
        })
        .then((answer) => {
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: answer.department
                },
                (err) => {
                    if (err) throw err;
                    console.log('Department added successfully!');
                    start();
                }
            );
        });
}
function addRole() {
    inquirer
        .prompt([
            {
                name: 'role',
                type: 'input',
                message: 'What role would you like to add?'
            },
            {
                name: 'salary',
                type: 'input',
                message: 'What is the salary for this role?'
            },
            {
                name: 'department_id',
                type: 'input',
                message: 'What is the department id for this role?'
            }
        ])
        .then((answer) => {
            connection.query(
                'INSERT INTO role SET ?',
                {
                    title: answer.role,
                    salary: answer.salary,
                    department_id: answer.department_id
                },
                (err) => {
                    if (err) throw err;
                    console.log('Role added successfully!');
                    start();
                }
            );
        });
}
// functions to update employee role and manager
function updateEmployeeRole() {
    let employees = [];
    let roles = [];
    // query to get employees and roles with promises to ensure they are ran in order
    const queryAsync = (queryString) => {
        return new Promise((resolve, reject) => {
            connection.query(queryString, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    };

    queryAsync('SELECT id, first_name, last_name FROM employee')
        .then((res) => {
            employees = res.map(({id, first_name, last_name}) => ({ name: `${first_name} ${last_name}`, value: id }));
            return queryAsync('SELECT id, title FROM role');
        })
        .then((res) => {
            roles = res.map(role => ({ name: role.title, value: role.id }));
            return inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee would you like to update?',
                    choices: employees
                },
                {
                    name: 'role',
                    type: 'list',
                    message: 'What is the employee\'s new role?',
                    choices: roles
                }
            ]);
        })
        .then((answer) => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            role_id: answer.role
                        },
                        {
                            id: answer.employee
                        }
                    ],
                    (err) => {
                        if (err) throw err;
                        console.log('Employee updated successfully!');
                        resolve();
                    }
                );
            });
        })
        .then(() => {
            start();
        })
        .catch(error => {
            console.error("Error updating employee!", error);
        });
    }
function updateEmployeeManager() {
    let employees = [];
    let managers = [];
     // query to get employees and managers with promises to ensure they are ran in order
    const queryAsync = (queryString) => {
        return new Promise((resolve, reject) => {
            connection.query(queryString, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    };

    queryAsync('SELECT id, first_name, last_name FROM employee')
        .then((res) => {
            employees = res.map(({id, first_name, last_name}) => ({ name: `${first_name} ${last_name}`, value: id }));
            return queryAsync('SELECT id, first_name, last_name FROM employee');
        })

        .then((res) => {
            managers = res.map(({id, first_name, last_name}) => ({ name: `${first_name} ${last_name}`, value: id }));
            //allow user to select no manager
            managers.push({ name: 'None', value: null });

            return inquirer.prompt([
                {
                    name: 'employee',
                    type: 'list',
                    message: 'Which employee would you like to update?',
                    choices: employees
                },
                {
                    name: 'manager',
                    type: 'list',
                    message: 'What is the employee\'s new manager?',
                    choices: managers
                }
            ]);
        })
        .then((answer) => {
            return new Promise((resolve, reject) => {
                connection.query(
                    'UPDATE employee SET ? WHERE ?',
                    [
                        {
                            manager_id: answer.manager
                        },
                        {
                            id: answer.employee
                        }
                    ],
                    (err) => {
                        if (err) throw err;
                        console.log('Employee updated successfully!');
                        resolve();
                    }
                );
            });
        })
        .then(() => {
            start();
        })
        .catch(error => {
            console.error("Error updating employee!", error);
        });
}
// functions to view all employees by manager and department
function viewAllEmployeesByManager() {
    const query = `
    SELECT
        manager.id AS manager_id,
        CONCAT(manager.first_name, ' ', manager.last_name) AS manager_name,
        GROUP_CONCAT(CONCAT(employee.first_name, ' ', employee.last_name) ORDER BY employee.last_name ASC) AS employee_names
    FROM 
        employee
    LEFT JOIN 
        employee AS manager ON employee.manager_id = manager.id
    WHERE
        manager.id IS NOT NULL
    GROUP BY
        manager.id
    ORDER BY
        manager.last_name ASC;
    `;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllEmployeesByDepartment() {
    //double join to get employee names and department names
    const query = `
    SELECT
        name AS department_name, 
        GROUP_CONCAT(CONCAT(employee.first_name, ' ', employee.last_name) ORDER BY employee.last_name ASC) AS employee_names
    FROM 
        employee
    JOIN 
        role ON employee.role_id = role.id
    JOIN
        department ON role.department_id = department.id
    WHERE
        department.id IS NOT NULL
    GROUP BY
        department.id
    ORDER BY
        department_name ASC;
    `;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}