/*
    suggestibles.js
    Contains all avaibale functions and methods 
    Provides filters and single 'get' on those lists
*/

let archive = {
    functions: {
        abs: {
            name: 'abs',
            description: 'Get the absolute value of a number',
            tags: ['unary', 'general'],
            args: [
                {
                    type: 'number',
                    name: 'number',
                    description: 'A number for which to get the absolute value',
                    optional: false
                }
            ],
            returns: {
                type: 'float',
                name: 'Absolute value'
            }
        },

        ceil: {
            name: 'ceil',
            description: 'Round a value towards plus infinity If x is complex, both real and imaginary part are rounded towards plus infinity. For matrices, the function is evaluated element wise.',
            tags: ['unary', 'general'],
            args: [
                {
                    type: 'number',
                    name: 'number',
                    description: 'A number to be rounded',
                    optional: false
                }
            ],
            returns: {
                type: 'integer',
                name: 'Rounded value'
            }
        },

        floor: {
            name: 'floor',
            description: 'Round a value towards minus infinity. For matrices, the function is evaluated element wise.',
            tags: ['unary', 'general'],
            args: [
                {
                    type: 'number',
                    name: 'number',
                    description: 'A number to be rounded',
                    optional: false
                }
            ],
            returns: {
                type: 'integer',
                name: 'Rounded value'
            }
        },

        max: {
            name: 'max',
            description: 'Get the maximum of two values. If NaN is given, the other value is returned.',
            tags: ['binary', 'general'],
            args: [
                {
                    type: 'number',
                    name: 'number',
                    description: 'First number to be compared',
                    optional: false
                },
                {
                    type: 'number',
                    name: 'number',
                    description: 'Second number to be compared',
                    optional: false
                },
            ],
            returns: {
                type: 'float',
                name: 'Maximum of the two numbers'
            }
        },

        min: {
            name: 'min',
            description: 'Get the minimum of two values. If NaN is given, the other value is returned.',
            tags: ['binary', 'general'],
            args: [
                {
                    type: 'number',
                    name: 'number',
                    description: 'First number to be compared',
                    optional: false
                },
                {
                    type: 'number',
                    name: 'number',
                    description: 'Second number to be compared',
                    optional: false
                },
            ],
            returns: {
                type: 'float',
                name: 'Minimum of the two numbers'
            }
        },

        s: {
            name: 'timeseries',
            description: 'Defines a lagged or unlagged timeseries based on a given signal.',
            tags: ['timeseries'],
            args: [
                {
                    type: 'signalid',
                    name: 'signalId',
                    description: 'The Id of a signal',
                    optional: false
                },
                {
                    type: 'integer',
                    name: 'lag',
                    description: 'The lag of the timeseries',
                    optional: true
                }
            ],
            returns: {
                type: 'timeseries',
                name: 'Timeseries'
            }
        },
    },

    methods: {
        at: {
            name: 'at',
            description: 'Takes the value of a timeseries at the given point in time. Returns NaN/0/false if there is no datapoint and no predecessor',
            on: ['timeseries'],
            args: [
                {
                    type: 'integer',
                    name: 'Time',
                    description: 'The point in time to be used',
                    optional: false
                }
            ],
            returns: {
                type: 'timeseriesentry', //['number', 'bool'],
                name: 'Value of timeseries at defined point in time'
            }
        },

        slice: {
            name: 'slice',
            description: 'Slice a portion out of a timeseries',
            on: ['timeseries'],
            args: [
                {
                    type: 'integer',
                    name: 'Start time',
                    description: 'The point in time to to start at',
                    optional: false
                },
                {
                    type: 'integer',
                    name: 'End time',
                    description: 'The point in time to to end at',
                    optional: false
                }
            ],
            returns: {
                type: 'timeseries',
                name: 'Slice of the timeseries at defined interval'
            }
        },
    }
}

let array = {
    //TODO
};

function get(type, key) {
    //console.log('suggestibles.get asked for', type, key);
    let categoryKey = type + "s"; //just the plural of e.g. 'method'
    if (archive[categoryKey].hasOwnProperty(key)) return archive[categoryKey][key];
    return null;
}

function getList(type, filter = {}) {
    switch (type) {
        case 'functions':
            var returnType = filter.hasOwnProperty('returnType') ? filter.returnType : '*';
            var contains = filter.hasOwnProperty('contains') ? filter.contains : null;
            var tags = filter.hasOwnProperty('tags') ? filter.tags : []; //TODO
            let filteredFunctions = [];
            for (var key in archive.functions) {
                let fc = archive.functions[key];
                fc['key'] = key;

                //filter 'contains'
                if (contains !== null && key.indexOf(contains) == -1) continue;

                //filter returnType
                if (returnType !== "*") {
                    //special case
                    if (returnType === 'number') {
                        if (!['integer', 'float'].includes(fc.returns.type)) continue;
                    }

                    //default
                    else {
                        if (fc.returns.type !== returnType) continue;
                    }
                }

                //add entry
                filteredFunctions.push(fc);
            }
            return filteredFunctions;

        case 'methods':
            var datatype = filter.hasOwnProperty('datatype') ? filter.datatype : 'timeseries'; //TODO
            var returnType = filter.hasOwnProperty('returnType') ? filter.returnType : '*';
            var returnTypes = filter.hasOwnProperty('returnTypes') ? filter.returnTypes : null;
            var worksOn = filter.hasOwnProperty('worksOn') ? filter.worksOn : null;
            var contains = filter.hasOwnProperty('contains') ? filter.contains : null;
            let filteredMethods = [];
            for (var key in archive.methods) {
                let fc = archive.methods[key];
                fc['key'] = key;

                //filter 'contains'
                if (contains !== null && key.indexOf(contains) == -1) continue;

                //filter returnType
                if (returnType !== "*" && fc.returns.type !== returnType) continue;

                //filter returnTypes
                if (returnTypes !== null && !returnTypes.includes(fc.returns.type)) continue;

                //filter worksOn
                if (worksOn !== null && !fc.on.includes(worksOn)) continue;

                //add entry
                filteredMethods.push(fc);
            }
            return filteredMethods;

        case 'array':
            break;
        default:
            console.log('Error: Wrong type ' + type);
            break;
    }
}

export const suggestibles = {
    getList: getList,
    get: get,
}