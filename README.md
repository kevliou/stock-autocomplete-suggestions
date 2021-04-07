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

The application loads the nasdaq_screener.csv file and outputs the following two files to the data folder:
* autocomplete-suggestions.json - Prefix search terms to ticker symbol of top 5 matches mapping
* ticker-dictionary.json - Ticker symbols to Company Name mapping

## Related Projects

To be populated

## License

This project uses the following license: [MIT License](LICENSE.md)