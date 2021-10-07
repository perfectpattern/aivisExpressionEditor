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

function handleEmptyExpression() {
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

function handleInsideFunctionParenthesis(checkResult) {
    let fct = suggestibles.get(checkResult.type, checkResult.key);

    //check if function/method exists
    if (fct === null) {
        //Error
        return {
            error: true,
            errorMsg: checkResult.type + " '" + checkResult.key + "' is unknown.",
            successMsg: null,
            currentFunction: null,
            suggestions: null,
        }
    }

    else {
        fct["currentArgument"] = checkResult.commas; //mark current argument
        let requiredDataType = checkResult.commas < fct.args.length ? fct.args[checkResult.commas].type : null;

        return {
            error: false,
            errorMsg: null,
            successMsg: "Requiring datatype " + requiredDataType,
            currentFunction: {
                spec: fct,
                type: checkResult.type
            },
            suggestions: {
                list: requiredDataType === 'signalid' ? signals.get() : suggestibles.getList('functions', { returnType: requiredDataType }),
                type: requiredDataType === 'signalid' ? 'signals' : 'functions',
                options: {}
            }
        };
    }
}

function handleInsideLetterBlock(letterBlockResult) {
    //Get function
    let fct = suggestibles.get(letterBlockResult.type, letterBlockResult.key);

    //check if function/method exists
    if (fct === null) {

        //try 'contains' filter
        let fcts = suggestibles.getList(letterBlockResult.type + "s", { contains: letterBlockResult.key });
        console.log(fcts);
        //Error: No matches
        if (fcts.length == 0) {

            return {
                error: true,
                errorMsg: letterBlockResult.type + " '" + letterBlockResult.key + "' is unknown.",
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
                successMsg: "Found matches containing " + letterBlockResult.key,
                currentFunction: null,
                suggestions: {
                    list: fcts,
                    type: letterBlockResult.type,
                    options: { 'replace': { start: letterBlockResult.start, letterBlockResult: letterBlockResult.end } }
                }
            }
        }
    } else {
        //Success
        fct["currentArgument"] = -1;
        return {
            error: false,
            errorMsg: null,
            successMsg: "Cursor is inside name of " + letterBlockResult.type + " " + letterBlockResult.key,
            currentFunction: {
                spec: fct,
                type: letterBlockResult.type
            },
            suggestions: null,
        };
    }
}

function handleTrailingDot(lhs) {
    let lhsWithoutDot = lhs.substring(0, lhs.length - 1);
    let node = expressionTools.parseRecursively(lhsWithoutDot); //parse node recursively from expression
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

function handleTrailingOperator(lhs, operatorResponse) {
    //Suggest functions returing same datatype as lhs of operator
    let lhsWithoutOperator = lhs.substring(0, lhs.length - operatorResponse.operator.length); //cut the operator from the end
    let node = expressionTools.parseRecursively(lhsWithoutOperator); //parse node recursively from expression
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
    //console.log(allowedDatatypesResponse);

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

function update(expression, cursorPos) {
    //get cursors lhs of expression
    let lhs = expression.substring(0, cursorPos).trim();

    //CASE expression is empty
    if (expression.length == 0) return handleEmptyExpression();

    //CASES where being inside a signal ID has to be excluded
    if (!expressionTools.checkInsideSignalId(lhs)) {
        //CASE trailing operator
        let operatorResponse = expressionTools.trailingOperator(lhs);
        if (operatorResponse !== null) return handleTrailingOperator(lhs, operatorResponse);

        //CASE trailing dot
        if (lhs.substring(lhs.length - 1) === '.') return handleTrailingDot(lhs);

        //CASE inside a letter block
        var letterBlockResult = expressionTools.getLetterBlock(expression, cursorPos);
        if (letterBlockResult !== null) return handleInsideLetterBlock(letterBlockResult);
    }

    //CASE inside function parenthesis
    var checkResult = expressionTools.endsInsideFunctionParenthesis(lhs);
    if (checkResult !== null)
        return handleInsideFunctionParenthesis(checkResult);

    //DEFAULT
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