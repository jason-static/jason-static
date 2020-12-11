# Data Scenarios: #

If an array of data exists, that array must be assigned to a variable so that the instance can be known.

## GOOD ##
```json
{
    "data": {
        "employee_names": [
            "greg",
            "bill"
        ]
    },
    "_name": "data.employee_names",
    "/[name].html": "templatefile.html"
}
```

```json
{
    "data": {
        "employees": [
            { "name": "greg" },
            { "name": "bill" }
        ]
    },
    "_employee": "data.employees",
    "/[employee.name].html": "templatefile.html"
}
```

## BAD ##
```json
{
    "data": {
        "employees": [
            { "name": "greg" },
            { "name": "bill" }
        ]
    },
    "/[data.employees.name].html": "templatefile.html"
}
```

```json
{
    "data": {
        "company": {
            "employees": [
                { "name": "greg" },
                { "name": "bill" }
            ]
        },
    },
    "_company": "data.company",
    "/[company.employees.name].html": "templatefile.html"
}
```
