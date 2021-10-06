/*
    operations.js
    Combines datatypoes based on a operator to get the resulting datatype
    e.g. add(integer,double) = double
    Validates at the same time
*/

let ops = {
    add: {
        float: {
            float: 'float',
            integer: 'float',
            timeseries: 'timeseries',
        },
        integer: {
            float: 'float',
            integer: 'integer',
            timeseries: 'timeseries',
        },
        timeseries: {
            float: 'timeseries',
            integer: 'timeseries',
            timeseries: 'timeseries',
        }
    },
    subtract: {
        float: {
            float: 'float',
            integer: 'float',
            timeseries: 'timeseries',
        },
        integer: {
            float: 'float',
            integer: 'integer',
            timeseries: 'timeseries',
        },
        timeseries: {
            float: 'timeseries',
            integer: 'timeseries',
            timeseries: 'timeseries',
        }
    },
    multiply: {
        float: {
            float: 'float',
            integer: 'float',
            timeseries: 'timeseries',
        },
        integer: {
            float: 'float',
            integer: 'integer',
            timeseries: 'timeseries',
        },
        timeseries: {
            float: 'timeseries',
            integer: 'timeseries',
            timeseries: 'timeseries',
        }
    },
    divide: {
        float: {
            float: 'float',
            integer: 'float',
            timeseries: 'timeseries',
        },
        integer: {
            float: 'float',
            integer: 'integer',
            timeseries: 'timeseries',
        },
        timeseries: {
            float: 'timeseries',
            integer: 'timeseries',
            timeseries: 'timeseries',
        }
    },
};

function combine(operator, datatype1, datatype2) {
    if (ops.hasOwnProperty(operator)) {
        if (ops[operator].hasOwnProperty(datatype1)) {
            if (ops[operator][datatype1].hasOwnProperty(datatype2)) {
                return { error: false, errorMsg: "", datatype: ops[operator][datatype1][datatype2] }
            }
            //Error
            else return { error: true, errorMsg: "Datatype '" + datatype2 + "' not allowed for operator '" + operator + "' and datatype '" + datatype1 + "'", datatype: null }
        }
        //Error
        else return { error: true, errorMsg: "Datatype '" + datatype1 + "' not allowed for operator '" + operator + "'", datatype: null }
    }
    //Error
    else return { error: true, errorMsg: "Unprocessable operator: " + operator, datatype: null }
}

function getAllowedDatatypes(operator, datatype1) {
    if (ops.hasOwnProperty(operator)) {
        if (ops[operator].hasOwnProperty(datatype1)) {
            return { error: false, errorMsg: "", datatypes: Object.keys(ops[operator][datatype1]) }
        }
        //Error
        else return { error: true, errorMsg: "Datatype '" + datatype1 + "' not allowed for operator '" + operator + "'", datatypes: [] }
    }
    //Error
    else return { error: true, errorMsg: "Unprocessable operator: " + operator, datatypes: [] }
}

export const operations = {
    combine: combine,
    getAllowedDatatypes: getAllowedDatatypes
};