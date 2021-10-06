/*
    expressionTools.js
    A set of helpfull, expression-related functions
*/

import { parse } from "mathjs";
import { utils } from "./utils";

function checkInsideSignalId(expression) {
    //is true, if, going backwards, a '"' comes before a ',' or '('
    let pos = expression.length;
    while (pos > 0) {
        let character = expression.substring(pos - 1, pos);
        switch (character) {
            case ',':
            case '(':
            case ')':
                return false;

            case '"':
                return true;

            default:
                pos--;
                break;
        }
    }
    return false;
}

function checkInsideParenthesis(expression, checkForFunction = true) {
    //I am inside a parenthesis if, going backwards, I find an opening parenthesis (function: with a leading letter), which was not closed before
    // if i count the commas, I know, in which argument I am: 1 comma is second argument. a = c+1

    let pos = expression.length;
    let parenthesisBalance = 0;
    let commas = 0;

    while (pos > 0) {
        let character = expression.substring(pos - 1, pos);
        let leadingExpression = expression.substring(0, pos - 1);

        //skip white space
        if (character === " ") continue;

        //Add ')'
        if (character === ")") parenthesisBalance++;

        //Subtract '('
        if (character === "(") parenthesisBalance--;

        //Count ','
        if (character === ",") commas++;

        //Evaluate
        if (parenthesisBalance == -1) //Condition 1: find '(' setting the counter to -1
            if (leadingExpression.trim().match(/[a-z]{1}$/) !== null || !checkForFunction) //found '(' has a leading letter
                return {
                    pos: pos,
                    commas: commas
                }

        //decrease position
        pos--;
    }
    return null;
}

function endsInsideFunctionParenthesis(expression) {
    //Check if given expression ends within a potential method or function

    //check if cursor is inside a functions parenthesis
    let res = checkInsideParenthesis(expression);

    //extract the function name
    if (res !== null) {
        let leadingExpression = expression.substring(0, res.pos - 1);
        //console.log('leadingExpression', leadingExpression);

        //check if method
        let matchMethod = leadingExpression.match(/\.[a-z]{1,20}$/); //ends with '.abcd'
        if (matchMethod) return {
            type: 'method',
            key: matchMethod[0].replace(".", ""),
            commas: res.commas
        }

        //check if function
        let matchFunction = leadingExpression.match(/[a-z]{1,20}$/); //ends with 'abcd'
        if (matchFunction) return {
            type: 'function',
            key: matchFunction[0],
            commas: res.commas
        }
    }

    return null;
}

function getLetterBlock(expression, cursorPos) {
    //console.log('checking', expression);
    //returns the letterblock the cursor is currently in, e.g. 'tes|t' -> returns 'test' (where | = cursor)
    let patt = /[a-z]{1,20}/gm;
    let match = expression.match(patt);
    while (match = patt.exec(expression)) {
        if (cursorPos >= match.index + 1 && cursorPos <= patt.lastIndex) {
            let leadingDot = expression.substring(match.index - 1, match.index) === '.';
            return {
                key: match[0],
                start: match.index,
                end: patt.lastIndex,
                type: leadingDot ? 'method' : 'function'
            }
        }

    }
    return null;
}

function insert(expression, suggestion, cursor, type, options = {}) {
    //insert a suggestion
    let splitExp = utils.splitStringAtIndex(expression, cursor);
    let newExp = null;
    let newCursor = 0;

    switch (type) {
        case 'functions':
        case 'function':
        case 'methods':
        case 'method':

            //replace an existing letterblock (autocomplete)
            if (options.hasOwnProperty('replace')) {
                newExp = expression.substring(0, options.replace.start) + suggestion.key + "()" + expression.substring(options.replace.end + 1);
                newCursor = options.replace.start + suggestion.key.length + 1;
            }

            //default
            else {
                newExp = splitExp[0] + suggestion.key + "()" + splitExp[1];
                newCursor = splitExp[0].length + suggestion.key.length + 1;
            }
            break;

        case 'signals':
            let indexoOfKomma = splitExp[1].indexOf(",");
            let indexOfBracket = splitExp[1].indexOf(")");

            let index = (indexoOfKomma >= 0 && indexOfBracket >= 0) ? Math.min(indexoOfKomma, indexOfBracket) : indexoOfKomma >= 0 ? indexoOfKomma : indexOfBracket;
            //console.log('indexoOfKomma', indexoOfKomma, 'indexOfBracket', indexOfBracket, 'index', index);
            let lead = splitExp[0].substring(0, splitExp[0].lastIndexOf("(") + 1);
            let tail = splitExp[1].substring(index);
            //console.log('lead', lead, 'tail', tail);
            newExp = lead + '"' + suggestion.id + '"' + tail;
            //cursorOffset = suggestion.id.length + 2;
            newCursor = lead.length + 1 + suggestion.id.length + 1;
            break;

        default:
            console.log('unknown type ' + type + " at expressionTools.insert");
            newExp = expression;
            break;
    }

    return {
        expression: newExp,
        cursor: newCursor,
    }
}

function parseRecursively(expression) {
    //trys parsing the expression recursively, removing the first character each time
    if (expression.length == 0) return null;
    try {
        return parse(expression);
    } catch (e) {
        return parseRecursively(expression.substring(1));
    }
}

function operatorToString(operator) {
    switch (operator) {
        case "+":
            return 'add';
        case "-":
            return 'subctract';
        case "*":
            return 'multiply';
        case "/":
            return 'divide';
        default:
            return null;
    }
}

function trailingOperator(expression) {
    expression = expression.trim();
    let match = null;

    //number operators
    match = expression.match(/[\+\-\*\/]$/);
    if (match) return {
        type: 'numeric',
        operator: match[0],
        operatorString: operatorToString(match[0])
    }

    //boolean operators
    match = expression.match(/&&|[<>!=]=|[<>&!]|\|{1,2}$/); //.match(/and|x?or|&&|[<>!=]=|[<>&!]|\|{1,2}$/);
    if (match) return {
        type: 'boolean',
        operator: match[0],
        operatorString: operatorToString(match[0])
    }
    return null;
}

function createFunctionString(spec, type) {
    //returns like "function parseInt(string: string, radix?: number): number"
    let activeArgument = spec.hasOwnProperty("currentArgument")
        ? spec.currentArgument
        : -1;
    let boldFunction =
        spec.hasOwnProperty("currentArgument") && activeArgument == -1;

    //create string
    let arr = [];

    spec.args.forEach((arg, index) => {
        let argString = arg.name + (arg.optional ? "?" : "") + ": " + arg.type;
        arr.push(
            index == activeArgument ? "<b>" + argString + "</b>" : argString
        );
    });
    return (
        (boldFunction ? "<b>" : "") +
        type +
        " " +
        spec.key +
        (boldFunction ? "</b>" : "") +
        "(" +
        arr.join(", ") +
        "): " +
        spec.returns.type
    );
}

export const expressionTools = {
    checkInsideParenthesis: checkInsideParenthesis,
    checkInsideSignalId: checkInsideSignalId,
    createFunctionString: createFunctionString,
    endsInsideFunctionParenthesis: endsInsideFunctionParenthesis,
    parseRecursively: parseRecursively,
    getLetterBlock: getLetterBlock,
    insert: insert,
    trailingOperator: trailingOperator,
}