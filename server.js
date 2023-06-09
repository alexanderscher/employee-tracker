const inquirer = require("inquirer");
const mysql = require("mysql2");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to the database!");
  run();
});

function run() {
  inquirer
    .prompt({
      type: "list",
      name: "action",
      message: "What would you like to do?",
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Add a Manager",
        "Update an employee role",
        "View Employees by Manager",
        "View Employees by Department",
        "Delete Departments | Roles | Employees",
        "View the total utilized budget of a department",
        "Exit",
      ],
    })
    .then((answer) => {
      switch (answer.action) {
        case "View all departments":
          viewDepartments();
          break;
        case "View all roles":
          viewRoles();
          break;
        case "View all employees":
          viewEmployees();
          break;
        case "Add a department":
          addDepartment();
          break;
        case "Add a role":
          addRole();
          break;
        case "Add an employee":
          addEmployee();
          break;
        case "View Employees by Manager":
          viewEmployeesByManagers();
          break;
        case "Update an employee role":
          updateRole();
          break;
        case "View Employees by Department":
          viewEmployees();
          break;
        case "View the total utilized budget of a department":
          departmentSalaries();
          break;
        case "Delete Departments | Roles | Employees":
          deleteData();
          break;
        case "Exit":
          connection.end();
          break;
      }
    });
}
function viewDepartments() {
  const query = "SELECT * FROM departments";
  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    run();
  });
}

function viewRoles() {
  const query =
    "SELECT roles.title, roles.id, departments.name, roles.salary from roles join departments on roles.department_id = departments.id";
  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    run();
  });
}

function viewEmployees() {
  query =
    "SELECT employees.role_id, employees.first_name, employees.last_name, roles.title, departments.name, roles.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager_name\
    FROM employees \
     LEFT JOIN roles ON employees.role_id = roles.id \
     LEFT JOIN departments ON roles.department_id = departments.id \
     LEFT JOIN employees m ON employees.manager_id = m.id";

  db.query(query, (err, results) => {
    if (err) throw err;
    console.table(results);
    run();
  });
}

function addDepartment() {
  inquirer
    .prompt({
      type: "input",
      name: "name",
      message: "Enter the name of the new department:",
    })
    .then((answer) => {
      const query = `INSERT INTO departments (name) VALUES ('${answer.name}')`;
      db.query(query, (err, res) => {
        if (err) throw err;
        console.log(`Added department ${answer.name} to the database`);
        run();
      });
    });
}

function addRole() {
  const query1 = "SELECT * FROM departments";
  db.query(query1, (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: "input",
          name: "title",
          message: "Enter the title of the new role:",
        },
        {
          type: "input",
          name: "salary",
          message: "Enter the salary of the new role:",
        },
        {
          type: "list",
          name: "department",
          message: "Select the department for the new role:",
          choices: res.map((department) => department.name),
        },
      ])
      .then((answers) => {
        const department = res.find(
          (department) => department.name === answers.department
        );
        const query2 = "INSERT INTO roles SET ?";
        db.query(
          query2,
          {
            title: answers.title,
            salary: answers.salary,
            department_id: department.id,
          },
          (err, res) => {
            if (err) throw err;
            console.log(
              `Added role ${answers.title} with salary ${answers.salary} to the ${answers.department} department in the database!`
            );
            run();
          }
        );
      });
  });
}

function addEmployee() {
  db.query("SELECT id, title FROM roles", (error, results) => {
    if (error) {
      console.error(error);
      return;
    }

    const roles = results.map(({ id, title }) => ({
      name: title,
      value: id,
    }));
    db.query(
      'SELECT id, CONCAT(first_name, " ", last_name) AS name FROM employees',
      (error, results) => {
        if (error) {
          console.error(error);
          return;
        }

        const managers = results.map(({ id, name }) => ({
          name,
          value: id,
        }));
        inquirer
          .prompt([
            {
              type: "input",
              name: "firstName",
              message: "Enter employees first name:",
            },
            {
              type: "input",
              name: "lastName",
              message: "Enter employees last name:",
            },
            {
              type: "list",
              name: "roleID",
              message: "Select the department for the new role:",
              choices: roles,
            },
            {
              type: "list",
              name: "managerId",
              message: "Select the employee manager:",
              choices: managers,
            },
          ])
          .then((answers) => {
            query =
              "INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)";
            const values = [
              (first_name = answers.firstName),
              (last_name = answers.lastName),
              (role_id = answers.roleID),
              (manager_id = answers.managerId),
            ];
            db.query(query, values, (err, res) => {
              if (err) throw err;
              console.log("Employee added successfully");
              run();
            });
          });
      }
    );
  });
}

function updateRole() {
  const queryE =
    "SELECT employees.id, employees.first_name, employees.last_name, roles.title FROM employees LEFT JOIN roles ON employees.role_id = roles.id";
  const queryR = "SELECT * FROM roles";
  db.query(queryE, (error, resE) => {
    db.query(queryR, (error, resR) => {
      inquirer
        .prompt([
          {
            type: "list",
            name: "employee",
            message: "Select the employee to update:",
            choices: resE.map((e) => `${e.first_name} ${e.last_name}`),
          },
          {
            type: "list",
            name: "role",
            message: "Choose a new role:",
            choices: resR.map((r) => r.title),
          },
        ])

        .then((answers) => {
          const employee = resE.find(
            (e) => `${e.first_name} ${e.last_name}` === answers.employee
          );
          const role = resR.find((r) => r.title === answers.role);

          const queryU = "UPDATE employees SET role_id = ? WHERE id = ?";
          db.query(queryU, [role.id, employee.id], (err, result) => {
            if (err) throw err;
            console.log("Updated Role");
            run();
          });
        });
    });
  });
}

function viewEmployeesByManagers() {
  const query =
    " select  roles.title, employees.first_name, employees.last_name, CONCAT(m.first_name,' ', m.last_name) AS manager_name, departments.name from employees LEFT JOIN employees m ON employees.manager_id = m.id LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id ORDER BY manager_name";

  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    run();
  });
}

function viewEmployees() {
  const query =
    "SELECT employees.first_name, employees.last_name, departments.name FROM employees LEFT JOIN roles ON employees.role_id = roles.id LEFT JOIN departments ON roles.department_id = departments.id";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    run();
  });
}

function departmentSalaries() {
  const query =
    "SELECT title, SUM(salary) as total_salary FROM roles GROUP BY title;";
  db.query(query, (err, res) => {
    if (err) throw err;
    console.table(res);
    run();
  });
}

function deleteEmployee() {
  const query = "SELECT * FROM employees;";
  db.query(query, (err, res) => {
    if (err) throw err;
    const employeeList = res.map((employee) => ({
      name: `${employee.first_name} ${employee.last_name}`,
      value: employee.id,
    }));
    inquirer
      .prompt({
        type: "list",
        name: "id",
        message: "Select the employee you want to delete:",
        choices: employeeList,
      })
      .then((answers) => {
        const query = "DELETE FROM employee WHERE id = ?";
        db.query(query, [answers.id], (err, res) => {
          if (err) throw err;
          console.log(`Deleted employee from the database`);
        });
      });
  });
}

function deleteData() {
  inquirer
    .prompt({
      type: "list",
      name: "data",
      message: "What would you like to delete?",
      choices: ["Employee", "Role", "Department"],
    })
    .then((answer) => {
      switch (answer.data) {
        case "Employee":
          deleteEmployee();
          break;
        case "Role":
          deleteRole();
          break;
        case "Department":
          deleteDepartment();
          break;
        default:
          console.log(`Invalid data: ${answer.data}`);
          start();
          break;
      }
    });
}

function deleteDepartment() {
  const query = "SELECT * FROM departments;";
  db.query(query, (err, res) => {
    if (err) throw err;
    const departmentsList = res.map((department) => ({
      name: `${department.name}`,
      value: department.id,
    }));
    inquirer
      .prompt({
        type: "list",
        name: "id",
        message: "Select the department you want to delete:",
        choices: departmentsList,
      })
      .then((answers) => {
        const query = "DELETE FROM departments WHERE id = ?";
        db.query(query, [answers.id], (err, res) => {
          if (err) throw err;
          console.log(`Deleted department from the database`);
        });
      });
  });
}
function deleteRole() {
  const query = "SELECT * FROM roles";
  db.query(query, (err, res) => {
    if (err) throw err;
    const rolesMap = res.map((role) => ({
      name: `${role.title}`,
      value: role.id,
    }));

    inquirer
      .prompt({
        type: "list",
        name: "roleId",
        message: "Select the role you want to delete:",
        choices: rolesMap,
      })
      .then((answer) => {
        const query = "DELETE FROM employees WHERE role_id =?";

        db.query(query, [answer.roleId], (err, res) => {
          if (err) throw err;
          console.log(`Deleted role from the database`);
        });

        const query1 = "DELETE FROM roles WHERE id =?";

        db.query(query1, [answer.roleId], (err, res) => {
          if (err) throw err;
          console.log(`Deleted role from the database`);
        });
      });
  });
}
