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

            // Only add the top 5 search results
            if(values.length<5 && !values.includes(ticker)){
                values.push(ticker);
            }
        }else{
            this.map.set(key, [ticker]);
        }
    }
    getMap(){
        return this.map;
    }
}

async function main(){
    const csvPath = './data/nasdaq_screener.csv';

    try{
        const data = await parseCSV(csvPath);
        createMap(data);
    } catch (err) {
        console.log(err);
    }   
}

main();

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

function createMap(data){
    // Create a dictionary mapping ticker symbol to name
    let tickerDict = {};
    data.forEach(el => {
        const ticker = el['Symbol'];
        const name = el['Name'];
        tickerDict[ticker] = name;
    });
    
    fs.writeFile('./data/ticker-dictionary.json',JSON.stringify(tickerDict), (err) => {
        if (err) {
            console.log(err);
        }
    })
    
    /*  
    * Priority order for autocomplete suggestions:
    * 1. Full ticker Symbol match (e.g. AMD)
    * 2. Partial prefix match on ticker symbol (e.g AM)
    * 3. Prefix match on company name (e.g. Advanced M)
    * 4. Partial match on words in a company name, sorted by market cap (e.g. Micro)
    * 
    * Only the top 5 results would be shown for each search
    */

    let suggestionsMap = new AutocompleteSuggestions();

    // Priority 1 and 2
    data.forEach(el => {
        const ticker = el['Symbol'];

        for (i=ticker.length; i>0; i--) {
            suggestionsMap.add(ticker.substr(0,i), ticker);
        }
    });

    // Priority 3
    data.forEach( el => {
        const ticker = el['Symbol'];
        const name = formatCompanyName(el['Name']);

        for (i=name.length; i>0; i--) {
            suggestionsMap.add(name.substring(0,i), ticker);
        }
    });

    // Priority 4
    data.sort(sortByProperty('Market Cap'));

    data.forEach( el => {
        const ticker = el['Symbol'];
        const name = formatCompanyName(el['Name']);

        // Skip the first word since it would have already been captured in Priority 3
        let spaceIndex = name.indexOf(' ');

        while (!(spaceIndex === -1)) {
            let partialName = name.substring(spaceIndex + 1);
            for (i=partialName.length; i>0; i--) {
                suggestionsMap.add(partialName.substring(0,i), ticker);
            }

            spaceIndex = name.indexOf(' ', spaceIndex + 1);
        }
    });

    // Convert Map to Object so it can by JSON stringify
    const convertMap = Object.fromEntries(suggestionsMap.getMap());

    fs.writeFile('./data/autocomplete-suggestions.json',JSON.stringify(convertMap), (err) => {
        if (err) {
            console.log(err);
        }
    })
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