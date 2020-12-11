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

## UNKNOWN / FUTURE ##
(not yet supported)
While it's not possible to reference a value via a child array of a named variable, it may be possible to have array assignment via variable parent...

```json
{
    "data": {
        "employees": [
            { "name": "greg" },
            { "name": "bill" }
        ]
    },
    "_employee_name": "data.employees.name",
    "/[employee.name].html": "templatefile.html"
}
```

## Notes:
 validate pathPatterns
 - does data exist at path?
   - accepatable:
     - direct data reference to usable string
       - (eg /[data.company.title])
     - variable assigned to useable string
       - (eg /[title].html :: _title: data.company.title)
     - subpath of variable assigned to useable string
       - (eg /[company.title].html :: _company: data.company)
     - variable assigned to array of usable strings
       - (eg /[name].html :: _name: data.company.employee_names)
     - subpath of variable assigned to array of objects where that subpath is a direct path to usable string
       - (eg /[employee.name].html :: _employee: data.company.employees)
   - not acceptable:
     - path containing an array not directly assigned to a variable
       - (eg /[data.company.employee.name].html)
       - (eg /[company.employee.name].html :: [_comapny]: data.company)
       - (eg /[company.employee_names].html :: [_company]: data.company)
 - ultimate data type must be valid url st
