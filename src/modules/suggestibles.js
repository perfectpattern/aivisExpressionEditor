let suggestiblesArchive = {
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
                type: 'number',
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
                type: 'number',
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
                type: 'number',
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
                type: 'number',
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
                type: 'number',
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
            datatypes: ['timeseries'],
            args: [
                {
                    type: 'integer',
                    name: 'Time',
                    description: 'The point in time to be used',
                    optional: false
                }
            ],
            returns: {
                type: ['number', 'bool'],
                name: 'Value of timeseries at defined point in time'
            }
        },

        slice: {
            name: 'slice',
            description: 'Slice a portion out of a timeseries',
            datatypes: ['timeseries'],
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
    if (suggestiblesArchive[categoryKey].hasOwnProperty(key)) return suggestiblesArchive[categoryKey][key];
    return null;
}

function getList(type, filter = {}) {
    switch (type) {
        case 'functions':
            var returnType = filter.hasOwnProperty('returnType') ? filter.returnType : '*';
            var contains = filter.hasOwnProperty('contains') ? filter.contains : null;
            var tags = filter.hasOwnProperty('tags') ? filter.tags : [];
            let filteredFunctions = [];
            for (var key in suggestiblesArchive.functions) {
                let fc = suggestiblesArchive.functions[key];
                fc['key'] = key;
                fc['type'] = 'function';
                filteredFunctions.push(fc);
            }
            return filteredFunctions;

        case 'methods':
            var datatype = filter.hasOwnProperty('datatype') ? filter.datatype : 'timeseries';
            var returnType = filter.hasOwnProperty('returnType') ? filter.returnType : '*';
            var contains = filter.hasOwnProperty('contains') ? filter.contains : null;
            let methods = [];
            //TODO
            return methods;

        case 'array':
            break;
        default:
            break;
    }
}

export const suggestibles = {
    getList: getList,
    get: get
}