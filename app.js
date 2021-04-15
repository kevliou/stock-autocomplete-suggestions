const Papa = require('papaparse');
const fs = require('fs');

class AutocompleteSuggestions{
    // Map the search term to ticker symbol in hash table. Only hold the top 5 search results.
    constructor(){
        this.map = new Map;
    }

    add(key, ticker){
        if(this.map.has(key)){
            const values = this.map.get(key);

            // Only add the top 5 unique search results
            if(values.length<5 && !values.includes(ticker)){
                values.push(ticker);
            }
        }else{
            this.map.set(key, [ticker]);
        }
    }

    getSuggestions(key){
        return this.map.get('key');
    }

    convertToJSON(){
        // Convert Map to Object so it can by JSON stringify
        const objMap = Object.fromEntries(this.map);
        return JSON.stringify(objMap);
    }
}

class SearchMappingService{
    constructor(data) {
        this.data = data;

        /*
        * Rank order for autocomplete suggestions:
        * 1. Full match on ticker Symbol match (e.g. AMD)
        * 3. Matches on company name substrings, sorted by descending market cap (e.g. Advanced Mic)
        * 2. Partial prefix match on ticker symbol, sorted by descending market cap (e.g AM)
        *
        * Only the top 5 results would be shown for each search
        */

        this.suggestionsMap = new AutocompleteSuggestions();
        this.addFullTicker();
        this.addCompanyName();
        this.addPartialTicker();
    }

    createTickerMap() {
        // Create a dictionary mapping ticker symbol to name
        let tickerDict = {};
        this.data.forEach(el => {
            const ticker = el['Symbol'];
            const name = el['Name'];
            tickerDict[ticker] = name;
        });
    
        return tickerDict;
    }

    createSearchJSON(){
        return this.suggestionsMap.convertToJSON();
    }

    addFullTicker() {
        this.data.sort(sortByProperty('Symbol'));

        this.data.forEach(el => {
            const ticker = el['Symbol'];
            this.suggestionsMap.add(ticker, ticker);
        })
    }

    addCompanyName() {
        this.data.sort(sortByProperty('-Market Cap'));

        this.data.forEach(el => {
            const ticker = el['Symbol'];
            const name = formatCompanyName(el['Name']);

            let spaceIndex = 0;

            while (spaceIndex !== -1) {
                let partialName = '';
                if (spaceIndex !== 0) {
                    partialName = name.substring(spaceIndex + 1);
                } else {
                    partialName = name.substring(spaceIndex);
                }
                
                for (let i = partialName.length; i> 0; i--) {
                    this.suggestionsMap.add(partialName.substring(0,i), ticker);
                }
            
                spaceIndex = name.indexOf(' ', spaceIndex + 1);
            }
        });
    }

    addPartialTicker(){
        // Private class function - Priority 1 & 2
        this.data.sort(sortByProperty('-Market Cap'));

        this.data.forEach(el => {
            const ticker = el['Symbol'];

            for (let i=ticker.length - 1; i>0; i--) {
                this.suggestionsMap.add(ticker.substr(0,i), ticker);
            }
        });
    }
}

// Export functions to be unit tested
module.exports.AutocompleteSuggestions = AutocompleteSuggestions;
module.exports.init = init;
module.exports.parseCSV = parseCSV;
module.exports.formatCompanyName = formatCompanyName;
module.exports.sortByProperty = sortByProperty;
module.exports.SearchMappingService = SearchMappingService;

async function init(){
    const csvPath = './data/nasdaq_screener.csv';
    const tickerPath = './data/ticker-dictionary.json';
    const suggestionsPath = './data/autocomplete-suggestions.json';

    try{
        const data = await parseCSV(csvPath);
        const mappingService = new SearchMappingService(data);
        
        const tickerDict = mappingService.createTickerMap();
        const suggestionsJson = mappingService.createSearchJSON();

        fs.writeFile(tickerPath, JSON.stringify(tickerDict), (err) => {
            if (err) {
                console.log(err);
            }
        });
    
        fs.writeFile(suggestionsPath, suggestionsJson, (err) => {
            if (err) {
                console.log(err);
            }
        });
    } catch (err) {
        console.log(err);
    }
    console.log('done');
}

function parseCSV(csvPath) {
    const file = fs.createReadStream(csvPath);

    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            complete: res => {
                resolve(res.data);
            },
            error (err, file){
                reject(err);
            }
        });
    });
}

function formatCompanyName(unformattedName){
    // Upper case Company Name and remove any non-alphanumerics except for spaces between words
    let name = String(unformattedName).toUpperCase();
    return name.replace(/[^0-9a-z\s]/gi,'').trim();
}

function sortByProperty(property){
    let sortOrder = 1;

    // Descending order if dash in front of property
    if (property[0] === '-'){
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b){
        if (a[property] < b[property]){
            return -1 * sortOrder;
        } else if (a[property] > b[property]){
            return 1 * sortOrder;
        } else {
            return 0 * sortOrder;
        }
    }
}