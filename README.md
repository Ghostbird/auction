# Ascending Auction Clock

This project creates an auction clock in the style of a [Dutch Auction](https://en.wikipedia.org/wiki/Dutch_auction).
## Usage

- Run the app (e.g. `ng serve`) or deploy it.
- Navigate to the app
- You can navigate to the root URI and click the wrench icon in the top-right corner to open a separate control tab that's pretty self-explanatory. It controls the other tab that displays the auction.
- Alternatively you can load a preconfigured clock using query parameters. The query parameters match the names on the control screen: `start`, `end`, `title`, and `time`. E.g. http://localhost:4200?title=Example%20auction&start=5&end=100&time=7
- At either control or auction page, you can start/stop the clock using the space bar and reset the clock by pressing escape.
- At the auction page, on a mobile you can start/stop the clock using a short tap, and reset it using a long tap (>300ms)

## Development

1. Clone this repo
2. Open the repo in your IDE (e.g. Visual Studio Code)
3. Run `npm install` in the repo folder
4. Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
