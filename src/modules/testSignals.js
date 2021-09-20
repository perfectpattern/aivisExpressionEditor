import json from '/test/metadata.json'

function get() {
    let data = [];
    json.columnSettings.forEach(signal => {
        signal.suggestionType = 'signal';
        data.push(signal);
    });
    return (data);
}

export const testSignals = {
    get: get
}