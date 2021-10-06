/*
    validator.js
    Validates and determines the resulting datatype of any expression
*/

import { utils } from "./utils";
import { suggestibles } from "./suggestibles";
import { operations } from "./operations";

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
    if (node === null) return { error: true, errorMsg: "No valid expression", datatype: null };
    if (node.isNode) {
        let identifier = node.getIdentifier();

        //Parenthesis
        if (identifier === 'ParenthesisNode') return evaluate(node.getContent())

        //Other nodes
        let nodeType = identifier.split(':')[0];
        switch (nodeType) {

            case 'ConstantNode':
                let value = node.getContent().value;
                let datatype = utils.isNumeric(value);
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
    return { error: true, errorMsg: "No valid expression", datatype: null };
}

export const validator = {
    evaluate: evaluate
}