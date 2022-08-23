# Ascending Auction Clock

This project creates an auction clock in the style of a [Dutch Auction](https://en.wikipedia.org/wiki/Dutch_auction), but it's a descending auction instead. Created to sell simple jobs to the one who will do the work at the lowest price.

If you need a standard descending auction clock, it's probably fairly easy to do by changing the mapping function in [`auction.component.ts:100`](src/app//auction/auction.component.ts#L100)

## Usage

- Run the app (e.g. `ng serve`) or deploy it.
- Navigate to it's URL
- You can navigate to the root URI and click the wrench icon in the top-right corner to open a separate control tab that's pretty self-explanator.
- Alternatively you can navigate to `rootUrl/maximumValue` or `rootUrl/maximum/time` where `maximum` is the maximum bid, and `time` is the count-down time of the clock. Such a navigation will immediately configure the clock.
- At either control or auction page, you can start/stop the clock using the space bar and reset the clock to zero by pressing escape.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
