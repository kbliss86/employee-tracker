const inquirer = require('inquirer');
const mysql = require('mysql2');
const express = require('express');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fordf150',
    database: 'company_db'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('connected as id ' + connection.threadId);
    start();
});

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
                'Exit'
            ]
        })
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
                case 'Exit':
                    connection.end();
                    break;
            }
        });
}

function viewAllEmployees() {
    connection.query('SELECT * FROM employee', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function viewAllDepartments() {
    connection.query('SELECT * FROM department', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}
function viewAllRoles() {
    connection.query('SELECT * FROM role', (err, res) => {
        if (err) throw err;
        console.table(res);
        start();
    });
}

function addEmployee() {
    let roles = [];
    let managers = [];

    const queryAsync = (queryString) => {
        return new Promise((resolve, reject) => {
            connection.query(queryString, (err, res) => {
                if (err) reject(err);
                resolve(res);
            });
        });
    };


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

function updateEmployeeRole() {
    let employees = [];
    let roles = [];

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
            employees = res.map(({id, first_name, last_name}) => ({
                name: `${first_name} ${last_name}`,
                value: id
            }));
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