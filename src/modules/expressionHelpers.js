import { exp, parse } from "mathjs";
import { helpers } from "./helpers";

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

function evaluate(node) {
    //evaluates and verifies a node recursively
    if (node === null) return null;
    if (node.isNode) {
        let identifier = node.getIdentifier();

        //Parenthesis
        if (identifier === 'ParenthesisNode') return evaluate(node.getContent())


        return { "evaluated": node.isFunctionNode };
    }


    /*switch (node.getIdentifier().split(':')[0]) {
        case 'FunctionNode':
            let functionName = node.getIdentifier().split(':')[1];

            break;

        case 'SymbolNode':
            let symbolName = node.getIdentifier().split(':')[1];

        default:
            break;
    }

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
    })*/
}

/*function getDatatype(expression) {
    let node = parseRecursively(expression);
    if (node === null) return null;
    return evaluateDatatype(node);
}*/

function getLetterBlock(expression, cursorPos) {
    //console.log('checking', expression);
    //returns the letterblock the cursor is currently in
    let patt = /[a-z]{1,20}/gm;
    let match = expression.match(patt);
    while (match = patt.exec(expression)) {
        if (cursorPos >= match.index + 1 && cursorPos <= patt.lastIndex) {
            let leadingDot = expression.substring(match.index - 1, match.index) === '.';
            return {
                key: match[0],
                type: leadingDot ? 'method' : 'function'
            }
        }

    }
    return null;
}

function insert(expression, suggestion, cursor) {
    let splitExp = helpers.splitStringAtIndex(expression, cursor);
    let newExp = null;
    let cursorOffset = 0;

    switch (suggestion.suggestionType) {
        case 'function':
            newExp = splitExp[0] + suggestion.key + "()" + splitExp[1];
            cursorOffset = suggestion.key.length + 1;
            break;

        case 'signal':
            let indexoOfKomma = splitExp[1].indexOf(",");
            let indexOfBracket = splitExp[1].indexOf(")");

            let index = (indexoOfKomma >= 0 && indexOfBracket >= 0) ? Math.min(indexoOfKomma, indexOfBracket) : indexoOfKomma >= 0 ? indexoOfKomma : indexOfBracket;
            //console.log('indexoOfKomma', indexoOfKomma, 'indexOfBracket', indexOfBracket, 'index', index);
            let lead = splitExp[0].substring(0, splitExp[0].lastIndexOf("(") + 1);
            let tail = splitExp[1].substring(index);
            console.log('lead', lead, 'tail', tail);
            newExp = lead + '"' + suggestion.id + '"' + tail;
            cursorOffset = suggestion.id.length + 2;
            break;

        default:
            newExp = expression;
            break;
    }

    return {
        expression: newExp,
        cursor: cursor + cursorOffset,
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

function trailingOperator(expression) {
    expression = expression.trim();
    let match = null;

    //number operators
    match = expression.match(/[\+\-\*\/]$/);
    if (match) return {
        type: 'numeric',
        operator: match[0]
    }

    //boolean operators
    match = expression.match(/&&|[<>!=]=|[<>&!]|\|{1,2}$/); //.match(/and|x?or|&&|[<>!=]=|[<>&!]|\|{1,2}$/);
    if (match) return {
        type: 'boolean',
        operator: match[0]
    }
    return null;
}

export const expressionHelpers = {
    checkInsideParenthesis: checkInsideParenthesis,
    endsInsideFunctionParenthesis: endsInsideFunctionParenthesis,
    evaluate: evaluate,
    parseRecursively: parseRecursively,
    getLetterBlock: getLetterBlock,
    insert: insert,
    trailingOperator: trailingOperator,
}