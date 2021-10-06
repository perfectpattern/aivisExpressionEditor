/*
    assistant.js
    Receives the current expression and cursor position after every user input.
    Identifies the current scope by cursor within expression and creates suggestions
*/

import { expressionTools } from "./expressionTools";
import { suggestibles } from "./suggestibles";
import { signals } from "./signals";
import { validator } from "./validator";
import { operations } from "./operations";

function update(expression, cursorStart, cursorEnd, newInput) {
    //expression is empty
    if (expression.length == 0) {
        return {
            error: false,
            errorMsg: null,
            successMsg: "Expression is null",
            currentFunction: null,
            suggestions: {
                list: suggestibles.getList('functions'),
                type: 'functions',
                options: {}
            },
        };
    }

    //cursor position
    let cursorPos = cursorEnd;

    //get cursors lhs of expression
    let lhs = expression.substring(0, cursorPos).trim(); //get left hand side

    //lhs of expression ends with operator: Suggest functions returing same datatype as lhs of operator
    let operatorResponse = expressionTools.trailingOperator(lhs);
    if (operatorResponse !== null && !expressionTools.checkInsideSignalId(lhs)) {
        lhs = lhs.substring(0, lhs.length - operatorResponse.operator.length); //cut the operator from the end
        let node = expressionTools.parseRecursively(lhs); //parse node recursively from expression
        let datatypeResponse = validator.evaluate(node); //evaluate datatype

        //Error
        if (datatypeResponse.error) {
            return {
                error: true,
                errorMsg: datatypeResponse.errorMsg,
                successMsg: null,
                currentFunction: null,
                suggestions: null,
            };
        }

        //Success: got datatype
        let allowedDatatypesResponse = operations.getAllowedDatatypes(operatorResponse.operatorString, datatypeResponse.datatype);
        console.log(allowedDatatypesResponse);

        //Error
        if (allowedDatatypesResponse.error) {
            return {
                error: true,
                errorMsg: allowedDatatypesResponse.errorMsg,
                successMsg: null,
                currentFunction: null,
                suggestions: null,
            };
        }

        //Success: got allowed datatypes
        return {
            error: false,
            errorMsg: null,
            successMsg: "Operator requests method with datatypes " + allowedDatatypesResponse.datatypes.join(","),
            currentFunction: null,
            suggestions: {
                list: suggestibles.getList('functions', { returnTypes: allowedDatatypesResponse.datatypes }),
                type: 'functions',
                options: {}
            },
        };
    }

    //lhs of expression ends with dot
    if (lhs.substring(lhs.length - 1) === '.' && !expressionTools.checkInsideSignalId(lhs)) {
        lhs = lhs.substring(0, lhs.length - 1);
        let node = expressionTools.parseRecursively(lhs); //parse node recursively from expression
        let datatypeResponse = validator.evaluate(node); //evaluate datatype

        //Error
        if (datatypeResponse.error) {
            return {
                error: true,
                errorMsg: datatypeResponse.errorMsg,
                successMsg: null,
                currentFunction: null,
                suggestions: null,
            };
        }
        //Success
        return {
            error: false,
            errorMsg: null,
            successMsg: "Dot requests method working on " + datatypeResponse.datatype,
            currentFunction: null,
            suggestions: {
                list: suggestibles.getList('methods', { worksOn: datatypeResponse.datatype }),
                type: 'methods',
                options: {}
            },
        };
    }

    //cursor is inside a name of a function or method
    var res = expressionTools.getLetterBlock(expression, cursorPos); //returns method or function
    if (res !== null && !expressionTools.checkInsideSignalId(lhs)) {
        let fct = suggestibles.get(res.type, res.key);
        //check if function/method exists
        if (fct === null) {

            //try 'contains' filter
            let fcts = suggestibles.getList(res.type + "s", { contains: res.key });
            console.log(fcts);
            //Error: No matches
            if (fcts.length == 0) {

                return {
                    error: true,
                    errorMsg: res.type + " '" + res.key + "' is unknown.",
                    successMsg: null,
                    currentFunction: null,
                    suggestions: null,
                }
            }

            //Success
            else {
                return {
                    error: false,
                    errorMsg: null,
                    successMsg: "Found matches containing " + res.key,
                    currentFunction: null,
                    suggestions: {
                        list: fcts,
                        type: res.type,
                        options: { 'replace': { start: res.start, end: res.end } }
                    }
                }
            }
        } else {
            //Success
            fct["currentArgument"] = -1;
            return {
                error: false,
                errorMsg: null,
                successMsg: "Cursor is inside name of " + res.type + " " + res.key,
                currentFunction: {
                    spec: fct,
                    type: res.type
                },
                suggestions: null,
            };
        }
    }

    //cursor is inside function or method parenthesis
    var res = expressionTools.endsInsideFunctionParenthesis(lhs);
    if (res !== null) {
        let fct = suggestibles.get(res.type, res.key);

        //check if function/method exists
        if (fct === null) {
            //Error
            return {
                error: true,
                errorMsg: res.type + " '" + res.key + "' is unknown.",
                successMsg: null,
                currentFunction: null,
                suggestions: null,
            }
        }

        else {
            fct["currentArgument"] = res.commas; //mark current argument
            let requiredDataType = res.commas < fct.args.length ? fct.args[res.commas].type : null;

            return {
                error: false,
                errorMsg: null,
                successMsg: "Requiring datatype " + requiredDataType,
                currentFunction: {
                    spec: fct,
                    type: res.type
                },
                suggestions: {
                    list: requiredDataType === 'signalid' ? signals.get() : suggestibles.getList('functions', { returnType: requiredDataType }),
                    type: requiredDataType === 'signalid' ? 'signals' : 'functions',
                    options: {}
                }
            };
        }
    }

    //nothing to do here
    return {
        error: false,
        errorMsg: null,
        successMsg: "Nothing to do here",
        currentFunction: null,
        suggestions: null,
    };
}

export const assistant = {
    update: update,
}