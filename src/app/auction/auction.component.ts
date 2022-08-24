import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  filter,
  fromEvent,
  interval,
  map,
  merge,
  Observable,
  of,
  partition,
  shareReplay,
  switchMap,
  takeUntil,
  takeWhile,
  skip,
  race,
  timer,
} from 'rxjs';
import { Settings } from '../settings';
import { ControlAction } from '../controlAction';

const TIME_CHUNK = 100;

const defaultSettings: Settings = {
  start: 0.0,
  end: 20.0,
  time: 10.0,
  title: 'Dutch auction',
};

const forAction = (action: ControlAction) =>
  filter<ControlAction>((incoming) => incoming === action);

const toViewModel = (settings: Settings) => {
  const range = settings.end - settings.start;
  const maximumCount = (settings.time * 1000) / TIME_CHUNK;
  return (count: number) => {
    const factor = count / maximumCount;
    return {
      title: settings.title,
      factor: range > 0 ? factor : 1 - factor,
      value: range * factor + settings.start,
      start: settings.start,
      end: settings.end,
    } as ViewModel;
  };
};

interface ViewModel {
  start: number;
  end: number;
  factor: number;
  value: number;
  title: string;
}

@Component({
  selector: 'app-auction',
  templateUrl: './auction.component.html',
  styleUrls: ['./auction.component.scss'],
})
export class AuctionComponent {
  public model$: Observable<ViewModel>;

  constructor(private route: ActivatedRoute) {
    const settingsChannel = new BroadcastChannel('auction-settings');
    const controlChannel = new BroadcastChannel('auction-control');

    const initialReset$ = of(null);

    const routeSettings$ = this.route.queryParams.pipe(
      map(
        (params) =>
          ({
            title: params['title'] ?? defaultSettings.title,
            start:
              parseFloat(params['start'] as string) || defaultSettings.start,
            end: parseFloat(params['end'] as string) || defaultSettings.end,
            time: parseFloat(params['time'] as string) || defaultSettings.time,
          } as Settings)
      )
    );
    const broadCastSettings$ = fromEvent<MessageEvent<Settings>, Settings>(
      settingsChannel,
      'message',
      (event) => event.data
    );
    const settings$ = merge(
      of(defaultSettings),
      broadCastSettings$,
      routeSettings$
    );

    const controlActions$ = fromEvent<
      MessageEvent<ControlAction>,
      ControlAction
    >(controlChannel, 'message', (event) => event.data);

    const touchStart$ = fromEvent<TouchEvent>(window, 'touchstart');
    const touchEnd$ = fromEvent<TouchEvent>(window, 'touchend');
    const [tap$, longTap$] = partition(
      touchStart$.pipe(
        switchMap(() =>
          race(
            // Touchend within 500ms, short tap
            touchEnd$.pipe(map(() => true)),
            // No touchend within timer period, long tap
            timer(300).pipe(map(() => false)),
          )
        )
      ),
      (x) => x
    );
    const spacePressed$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter((event) => event.key === ' ')
    );
    const [start$, stop$] = partition(
      merge(
        controlActions$.pipe(forAction('startStop')),
        spacePressed$,
        tap$
      ).pipe(
        // This is essential to make the partition of the observable work.
        // If it's not shareReplayed, the partition re-subscribes, and the count is restarted.
        shareReplay({ bufferSize: 1, refCount: true })
      ),
      (_, i) => i % 2 === 0
    );
    const escapePressed$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter((event) => event.key === 'Escape')
    );
    const reset$ = merge(
      initialReset$,
      controlActions$.pipe(forAction('reset')),
      escapePressed$,
      longTap$,
    ).pipe(shareReplay(1));

    this.model$ = settings$.pipe(
      switchMap((settings) =>
        merge(
          start$.pipe(
            switchMap(() => {
              const maximumCount = (settings.time * 1000) / TIME_CHUNK;
              return interval(TIME_CHUNK).pipe(
                takeWhile((count) => count <= maximumCount),
                map(toViewModel(settings)),
                takeUntil(merge(stop$, reset$.pipe(skip(1))))
              );
            })
          ),
          reset$.pipe(map(() => toViewModel(settings)(0)))
        )
      )
    );
  }
}
