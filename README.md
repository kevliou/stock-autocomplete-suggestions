# Stock Autocomplete Suggestions

This project transforms Nasdaq's stock screener data into JSON outputs files to be used for autocomplete/predictive suggestions in a search bar.

The Nasdaq's stock screener data in this application is as of April 1, 2021. More recent stock data can be accessed at: [Nasdaq Stock Screener](https://www.nasdaq.com/market-activity/stocks/screener)

## Development Setup

### Prerequisites

Make sure you have the following:
* Install [Node.js](https://nodejs.org/en/download/), which should include [Node Package Manager](https://www.npmjs.com/get-npm)

### Downloading Project

To clone the repository:
```
git clone https://github.com/kevliou/stock-autocomplete-suggestions.git
```

### Setting Up a Project

Install the dependencies:
```
npm install
```

Run the application:
```
npm start
```

Run the test scripts:
```
npm test
```

## Outputs

The application reads the nasdaq_screener.csv file and updates the following two files in the data folder:

* *ticker-dictionary.json* - Ticker symbols to Company Name mapping
``` json
{
    "FB":"Facebook Inc.", 
    "AMZN":"Amazon.com Inc.",
    "AAPL":"Apple Inc.",
    "NFLX":"Netflix Inc.", 
    "GOOGL":"Alphabet Inc."
}
```

* *autocomplete-suggestions.json* - Prefix search terms to ticker symbol of the top 5 matches. The list order is sorted by: (1) search term having exact match to ticker, or (2) search term contain within company name or ticker, sorted by market cap
``` json
{
    "TESL":["TSLA"],
    "TES":["TSLA","TESS","AEHR"],
    "TE":["TSLA","TXN","RTX","UBER","MU"],
    "T":["T","TSM","TSLA","DIS","HD"]
}
```

## Related Projects

To be populated

## License

This project uses the following license: [MIT License](LICENSE.md)