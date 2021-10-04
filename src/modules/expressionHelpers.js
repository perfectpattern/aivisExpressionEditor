import { exp, parse } from "mathjs";
import { helpers } from "./helpers";
import { suggestibles } from "./suggestibles";
import { operations } from "./operations";

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

function getMethodDatatype(methodKey, datatypeResponse) {
    //check datatype of (datatypeResponse.datatype).methodKey
    //error
    if (datatypeResponse.error) return datatypeResponse;

    //get method specs
    let spec = suggestibles.get('method', methodKey);

    //error: method unknown
    if (spec === null) return { error: true, errorMsg: "Unknown method: " + methodKey, datatype: null };

    //error: method not allowed on datatype
    if (!spec.on.includes(datatypeResponse.datatype)) return { error: true, errorMsg: "Method '" + methodKey + "' not allowed for datatype '" + datatypeResponse.datatype + "'", datatype: null };

    //success
    return { error: false, errorMsg: "", datatype: spec.returns.type }; //TODO
}

function combineDatatypes(operator, datatypes) {
    //Error
    if (datatypes.length !== 2) return { error: true, errorMsg: "Can't combine datatypes with amount " + datatypes.length, datatype: null };

    return operations.combine(operator, datatypes[0], datatypes[1]);
}

function evaluate(node) {
    //evaluates and verifies a node recursively
    //returns the datataype of the node or an errorMsg
    if (node === null) return null;
    if (node.isNode) {
        let identifier = node.getIdentifier();

        //Parenthesis
        if (identifier === 'ParenthesisNode') return evaluate(node.getContent())

        //Other nodes
        let nodeType = identifier.split(':')[0];
        switch (nodeType) {

            case 'ConstantNode':
                let value = node.getContent().value;
                let datatype = helpers.isNumeric(value);
                //Error
                if (datatype === null) return { error: true, errorMsg: "Not a numeric: " + value, datatype: null };
                //Success
                return { error: false, errorMsg: "", datatype: datatype };

            case 'SymbolNode':
                return { error: false, errorMsg: "", datatype: "symbol" }; //TODO

            case 'OperatorNode':
                let args = node.getContent().args;
                let datatypes = [];
                let operator = node.getContent().fn;

                //loop through arguments and get eachs arg datatype
                for (var i = 0; i < args.length; i++) {
                    let arg = args[i];
                    let datatypeResponse = evaluate(arg);
                    //Error
                    if (datatypeResponse.error) return datatypeResponse;
                    //Success
                    datatypes.push(datatypeResponse.datatype);
                }

                return combineDatatypes(
                    operator,
                    datatypes
                );

            case 'FunctionNode':
                //get function specifier
                let fctNode = node.getContent().fn.getIdentifier();

                //Function
                if (fctNode === 'SymbolNode') {
                    let functionName = identifier.split(':')[1];
                    let spec = suggestibles.get('function', functionName);
                    //Error
                    if (spec === null) return { error: true, errorMsg: "Unknown function: " + functionName, datatype: null };
                    //Success
                    return { error: false, errorMsg: "", datatype: spec.returns.type };
                }

                //Method
                else if (fctNode === 'AccessorNode') {
                    let methodName = identifier.split(':')[1];
                    let accessorNodeContent = node.getContent().fn.object;
                    return getMethodDatatype(methodName, evaluate(accessorNodeContent));
                }

                //Error
                else {
                    return { error: true, errorMsg: "Unknown function node: " + fctNode, datatype: null };
                }


            default:
                return { error: true, errorMsg: "Unprocessable nodeType: " + nodeType, datatype: null };
        }
    }
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
                type: leadingDot ? 'method' : 'function'
            }
        }

    }
    return null;
}

function insert(expression, suggestion, cursor) {
    //insert a suggestion
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