# Thaqalayn Web Scraper

Thaqalayn Web Scraper is a Node.js application designed to scrape Islamic books from the [Thaqalayn](https://thaqalayn.net) website.

Most probably the fastest web scraper that is available, as it opens a new browser for each volume.
As an example, al-Kafi would have 8 browsers open, each one working at the same time.

## Table of Contents

1. [Requirements](#requirements)
2. [Installation](#installation)
3. [How to Select Books](#how-to-select-books)
4. [Usage](#usage)
5. [Troubleshooting](#troubleshooting)
6. [License](#license)

## Requirements

- Node.js (12.x or higher)
- Puppeteer package
- A working Internet connection

## Installation

1. Clone this repository to your local machine.
2. Navigate to the directory where the repository is cloned.
3. Run the following command to install the dependencies:

   ```bash
   npm install
   ```

## How to Select Books

The scraper allows users to choose specific books to scrape. You can customize the selection in the `index.js` file.

Here's how to do it:

1. Open `index.js` in your favorite code editor.
2. Locate the `SELECTED_BOOKS` constant.
3. Add or remove books from the array as desired. For example, if you want to scrape `AlKafi` and `AlTawhid`, set the constant as:

   ```javascript
   const SELECTED_BOOKS = [AlKafi, AlTawhid];
   ```

Available books:

- AlKafi
- MujamAlAhadithAlMutabara
- AlKhisal
- UyunAkhbarAlRida
- AlAmali
- AlTawhid
- KitabAlDuafa
- KitabAlGhaybaFirst
- KitabAlGhaybaSecond
- ThawabAlAmalWaIqabAlAmal
- KamilAlZiyarat
- FadailAlShia
- SifatAlShia
- MaaniAlAkhbar
- KitabAlMumin
- KitabAlZuhd
- NahjAlBalagha

## Usage

Once you have selected the desired books, you can run the scraper with the following command:

```bash
node index.js
```

The scraper will start processing the selected books and will save the extracted information accordingly.

## Troubleshooting

If you encounter any problems, ensure that all dependencies are properly installed and that you have the correct permissions to execute the script.

## License

This project is released for everyone. You are free to use it however you want.
