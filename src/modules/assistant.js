import { helpers } from "./helpers";
import { expressionHelpers } from "./expressionHelpers";
import { suggestibles } from "./suggestibles";
import { testSignals } from "./testSignals";

function isAllowedLHS(operator, node) {
    return true;
    switch (operator) {
        case "+":
            return !['OperatorNode:add'].includes(node.getIdentifier());

        default:
            return false;
    }
}

function determineDatatype(token) {
    return null;
}

function getDatatype(node) { //boolean, numeric, timeseries, array
    node.traverse(function (node, path, parent) {
        switch (node.type) {
            case 'OperatorNode':
                console.log(node.type, node.op)
                break
            case 'ConstantNode':
                console.log(node.type, node.value)
                break
            case 'SymbolNode':
                console.log(node.type, node.name)
                break
            case 'FunctionNode':
                console.log(node.type, node.name)
                break
            default:
                console.log(node.type)
        }
    })
}

function insert(expression, suggestion, cursor) {
    return expressionHelpers.insert(expression, suggestion, cursor);
}

function update(expression, cursorStart, cursorEnd, newInput) {
    //expression is empty
    if (expression.length == 0) {
        return {
            currentFunction: null,
            suggestions: suggestibles.getList('functions'),
            requiredDataType: null,
        };
    }

    //cursor position
    let cursorPos = cursorEnd;

    //get cursors lhs of expression
    let lhs = expression.substring(0, cursorPos).trim(); //get left hand side

    //lhs of expression ends with operator
    let operator = expressionHelpers.trailingOperator(lhs);
    if (operator !== null) {
        let datatype = expressionHelpers.getDatatype(lhs.substring(0, lhs.length - operator.operator.length));
        console.log(datatype);
        return {
            currentFunction: null,
            suggestions: suggestibles.getList('functions'),
            requiredDataType: null,
        };
    }

    //lhs of expression ends with dot
    if (lhs.substring(lhs.length - 1) === '.') {
        let datatype = expressionHelpers.getDatatype(lhs.substring(0, lhs.length - 1));
        console.log(datatype);
        return {
            currentFunction: null,
            suggestions: suggestibles.getList('methods'),
            requiredDataType: null,
        };
    }

    //cursor is inside a function or method name
    var res = expressionHelpers.getLetterBlock(expression, cursorPos);
    if (res !== null) {
        let fct = suggestibles.get(res.type, res.key);
        if (fct !== null) {  //check if function exists
            fct["currentArgument"] = -1;
            return {
                currentFunction: fct,
                suggestions: null,
                requiredDataType: null,
            };
        }
    }

    //cursor is inside function or method parenthesis
    var res = expressionHelpers.endsInsideFunctionParenthesis(lhs);
    if (res !== null) {
        let fct = suggestibles.get(res.type, res.key); //check if function exists
        if (fct !== null) {
            fct["currentArgument"] = res.commas; //mark current argument
            let requiredDataType = res.commas < fct.args.length ? fct.args[res.commas].type : null;
            return {
                currentFunction: fct,
                suggestions: requiredDataType === 'signalid' ? testSignals.get() : suggestibles.getList('functions'),
                requiredDataType: requiredDataType,
            };
        }
    }

    return {
        currentFunction: null,
        suggestions: null,
        requiredDataType: null,
    };
}

export const assistant = {
    update: update,
    insert: insert,
}