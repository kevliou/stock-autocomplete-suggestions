const { test, expect, describe, beforeAll } = require('@jest/globals');
const app = require('./app');

// describe('CSV parser on Nasdaq stock screener', () => {
//     const parseCSV = app.parseCSV;
//     const csvPath = './data/nasdaq_screener.csv';
//     let data;

//     beforeAll(async () => {
//         data = await parseCSV(csvPath);
//     });

//     test('has data', () => {
//         expect(data).toBeDefined();
//     });
//     test('has Symbol property', () => {
//         expect(data[0].hasOwnProperty('Symbol')).toBeTruthy();
//     });
//     test('has Name property', () => {
//         expect(data[0].hasOwnProperty('Name')).toBeTruthy();
//     });
//     test('has Market Cap property', () => {
//         expect(data[0].hasOwnProperty('Market Cap')).toBeTruthy();
//     });
// });

describe('Autocomplete Suggestions class object', () => {
    const AutocompleteSuggestions = app.AutocompleteSuggestions;
    let suggestionMap = new AutocompleteSuggestions;
    suggestionMap.add('key', 'Item0');
    suggestionMap.add('key', 'Item1');
    suggestionMap.add('key', 'Item2');
    suggestionMap.add('key', 'Item3');
    suggestionMap.add('key', 'Item4');
    suggestionMap.add('key', 'Item5');
    let suggestions = suggestionMap.getSuggestions('key');

    test('has only 5 entries', () => {
        expect(suggestions.length).toEqual(5);
    });

    test('has correct suggestions', () => {
        expect(suggestions).toEqual(['Item0', 'Item1', 'Item2', 'Item3','Item4']);
    });

    test('converts to JSON', () => {
        expect(suggestionMap.convertToJSON()).toEqual('{"key":["Item0","Item1","Item2","Item3","Item4"]}');
    });
});

describe('Format company name', () => {
    const formatCompanyName = app.formatCompanyName;
    test('is upper case', () => {
        expect(formatCompanyName('Apple')).toEqual('APPLE');
    });
    test('remove non-alphamumericals', () => {
        expect(formatCompanyName('+Apple#$&*12!')).toEqual('APPLE12');
    });
    test('maintains space between words', () => {
        expect(formatCompanyName('Apple Company')).toEqual('APPLE COMPANY');
    });
});

describe('Sort by property', () => {
    const sortByProperty = app.sortByProperty;
    const stockInfo = [
        {'Name': 'First', 'Symbol': 'A', 'Market Cap': 1000},
        {'Name': 'Second', 'Symbol': 'B', 'Market Cap': 10000},
        {'Name': 'Third', 'Symbol': 'C', 'Market Cap': 100}
    ];

    test('sorts ascending', () => {
        const answer = [
            {'Name': 'Third', 'Symbol': 'C', 'Market Cap': 100},
            {'Name': 'First', 'Symbol': 'A', 'Market Cap': 1000},
            {'Name': 'Second', 'Symbol': 'B', 'Market Cap': 10000}
        ];

        expect(stockInfo.sort(sortByProperty('Market Cap'))).toEqual(answer);
    });
    test('sorts descending', () => {
        const answer = [
            {'Name': 'Third', 'Symbol': 'C', 'Market Cap': 100},
            {'Name': 'Second', 'Symbol': 'B', 'Market Cap': 10000},
            {'Name': 'First', 'Symbol': 'A', 'Market Cap': 1000}
        ];

        expect(stockInfo.sort(sortByProperty('-Symbol'))).toEqual(answer);
    });
});

describe('Search mapping service', () => {
    const data = [ {'Name': 'American Airlines Group Inc', 'Symbol': 'AAL', 'Market Cap': 1000 } ]
    const SearchMappingService = app.SearchMappingService;
    let mappingService = new SearchMappingService(data);

    test('create ticker dictionary', () => {
        let suggestionsMap = new app.AutocompleteSuggestions();
        const dict = mappingService.createTickerMap();
        expect(dict).toEqual({'AAL': 'American Airlines Group Inc'})
    });

    test('create ticker prefix mapping', () => {
        const answer = {
            'AAL': ['AAL'],
            'AA' : ['AAL'],
            'A' : ['AAL']
        }

        let suggestionsMap = new app.AutocompleteSuggestions();
        mappingService.addTickerMap(suggestionsMap);
        expect(suggestionsMap.convertToJSON()).toEqual(JSON.stringify(answer));
    });

    test('create full company name prefix mapping', () => {
        const answer = {
            'AMERICAN AIRLINES GROUP INC' : ['AAL'],
            'AMERICAN AIRLINES GROUP IN' : ['AAL'],
            'AMERICAN AIRLINES GROUP I' : ['AAL'],
            'AMERICAN AIRLINES GROUP ' : ['AAL'],
            'AMERICAN AIRLINES GROUP' : ['AAL'],
            'AMERICAN AIRLINES GROU' : ['AAL'],
            'AMERICAN AIRLINES GRO' : ['AAL'],
            'AMERICAN AIRLINES GR' : ['AAL'],
            'AMERICAN AIRLINES G' : ['AAL'],
            'AMERICAN AIRLINES ' : ['AAL'],
            'AMERICAN AIRLINES' : ['AAL'],
            'AMERICAN AIRLINE' : ['AAL'],
            'AMERICAN AIRLIN' : ['AAL'],
            'AMERICAN AIRLI' : ['AAL'],
            'AMERICAN AIRL' : ['AAL'],
            'AMERICAN AIR' : ['AAL'],
            'AMERICAN AI' : ['AAL'],
            'AMERICAN A' : ['AAL'],
            'AMERICAN ' : ['AAL'],
            'AMERICAN' : ['AAL'],
            'AMERICA' : ['AAL'],
            'AMERIC' : ['AAL'],
            'AMERI' : ['AAL'],
            'AMER' : ['AAL'],
            'AME' : ['AAL'],
            'AM' : ['AAL'],
            'A' : ['AAL']
        }

        let suggestionsMap = new app.AutocompleteSuggestions();
        mappingService.addFullCompanyNameMap(suggestionsMap);
        expect(suggestionsMap.convertToJSON()).toEqual(JSON.stringify(answer));
    });

    test('create partial company name prefix mapping', () => {
        // Skips the first word since it would be covered by the full search
        const answer = {
            'AIRLINES GROUP INC' : ['AAL'],
            'AIRLINES GROUP IN' : ['AAL'],
            'AIRLINES GROUP I' : ['AAL'],
            'AIRLINES GROUP ' : ['AAL'],
            'AIRLINES GROUP' : ['AAL'],
            'AIRLINES GROU' : ['AAL'],
            'AIRLINES GRO' : ['AAL'],
            'AIRLINES GR' : ['AAL'],
            'AIRLINES G' : ['AAL'],
            'AIRLINES ' : ['AAL'],
            'AIRLINES' : ['AAL'],
            'AIRLINE' : ['AAL'],
            'AIRLIN' : ['AAL'],
            'AIRLI' : ['AAL'],
            'AIRL' : ['AAL'],
            'AIR' : ['AAL'],
            'AI' : ['AAL'],
            'A' : ['AAL'],
            'GROUP INC' : ['AAL'],
            'GROUP IN' : ['AAL'],
            'GROUP I' : ['AAL'],
            'GROUP ' : ['AAL'],
            'GROUP' : ['AAL'],
            'GROU' : ['AAL'],
            'GRO' : ['AAL'],
            'GR' : ['AAL'],
            'G' : ['AAL'],
            'INC' : ['AAL'],
            'IN' : ['AAL'],
            'I' : ['AAL']
        }

        let suggestionsMap = new app.AutocompleteSuggestions();
        mappingService.addPartialCompanyNameMap(suggestionsMap);
        expect(suggestionsMap.convertToJSON()).toEqual(JSON.stringify(answer));
    });
});