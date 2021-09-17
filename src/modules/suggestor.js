import { exp, parse, evaluate } from "mathjs";
import { helpers } from "./helpers";
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

function getDatatype(node) {
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

function getLeftHandToken(expression, operator) {
    console.log('parsing ' + expression);
    if (expression.length == 0) return 'no valid lhs';
    try {
        let node = parse(expression);
        if (this.isAllowedLHS(operator, node))
            return "\"" + node.getContent() + "\" -> " + node.getIdentifier() + " Datatype: " + this.getDatatype(node);
        return this.getLeftHandToken(expression.substring(1));
    } catch (e) {
        console.log(JSON.stringify(e.message));
        return this.getLeftHandToken(expression.substring(1));
    }
}

function makeSuggestions(cursorStart, cursorEnd) {
    if (cursorStart !== cursorEnd) return; //no suggestions for selections
    let lastCharacter =
        cursorStart >= 1
            ? this.expression.substring(cursorStart - 1, cursorStart)
            : null;
    console.log(lastCharacter);
    this.setSuggestions([{ key: "test", value: "test" }]);

    if (lastCharacter === "+") {
        this.lhs = helpers.getLeftHandToken(
            this.expression.substring(0, cursorStart - 1),
            "+"
        );

        this.setSuggestions([
            { key: "test", value: "test" },
            { key: "test2", value: "test2" },
        ]);
    } else {
        this.lhs = "unknown";
    }
}

function checkIfInsideFunction(expression, cursor) {
    let quitLoop = false;
    let remainingExpression = '';
    let key = null;
    let type = null;

    while (cursor > 0 && !quitLoop) {
        let character = expression.substring(cursor - 1, cursor);
        //console.log('Checking character \"' + character + "\"");
        switch (character) {
            case " ":
                //skip white space
                break;

            case ")":
                quitLoop = true;
                break;

            case "(":
                remainingExpression = expression.substring(0, cursor - 1);
                quitLoop = true;
                break;

            default:
                break;
        }

        cursor--;
    }

    //Check if remaining expression ends with a valid function name
    //console.log('remainingExpression', remainingExpression);
    if (remainingExpression.length > 0) {
        //check if method
        let matchMethod = remainingExpression.match(/\.[a-z]{1,20}$/); //ends with '.abcd'
        if (matchMethod) {
            let key = matchMethod[0].replace(".", "");

            //check if method exists
            let method = suggestibles.get('method', key);

            //return method
            if (method !== null) {
                return {
                    type: 'method',
                    key: key,
                    payload: method
                }
            }
        }

        //Check if function
        else {
            let matchFunction = remainingExpression.match(/[a-z]{1,20}$/); //ends with 'abcd'
            if (matchFunction) {
                let key = matchFunction[0];

                //check if function exists
                let fct = suggestibles.get('function', key);

                //return method
                if (fct !== null) {
                    return {
                        type: 'function',
                        key: key,
                        payload: fct
                    }
                }
            }
        }
    }

    return null;

}

function getScope(expression, cursorPos) {

    //expression is empty
    if (expression.length == 0) {
        return 'empty';
    }

    //if cursor is at end of expression
    else if (cursorPos == expression.length) {
        let lastCharacter =
            cursorPos >= 1
                ? expression.substring(cursorPos - 1, cursorPos)
                : null;
    }

    //cursor is inside expression
    else {
        //check if inside a function (if I go to left and find "xyz(" without finding a ")" before)
        xxxxxxxxxxxxxxxxxxxxxxxxCONTINUE HEREXXXXXXXXXXXXXXXXXXXXXXXX
    }
}

function update(expression, cursorStart, cursorEnd, newInput) {
    //test(expression, cursorStart, cursorEnd, newInput);
    let cursorPos = cursorEnd;
    let scope = getScope(expression, cursorPos);
    switch (scope) {
        case 'empty':
            return (suggestibles.getList('functions'));

        default:
            break;
    }
}

function insert(expression, suggestion, cursor) {
    let splitExp = helpers.splitStringAtIndex(expression, cursor);
    let newExp = null;
    let cursorOffset = 0;

    switch (suggestion.type) {
        case 'function':
            newExp = splitExp[0] + suggestion.key + "()" + splitExp[1];
            cursorOffset = suggestion.key.length + 1;
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

function test(expression, cursorStart, cursorEnd, newInput) {
    let cursorPos = cursorEnd;
    console.log('crsorPos', cursorPos);
    console.log('expression.length', expression.length);
}

export const suggestor = {
    update: update,
    insert: insert,
    test: checkIfInsideFunction
}