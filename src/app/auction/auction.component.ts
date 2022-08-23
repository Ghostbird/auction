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
} from 'rxjs';
import { Settings } from '../settings';
import { ControlAction } from '../controlAction';

const TIME_CHUNK = 100;

const defaultSettings: Settings = { maximum: 20.0, time: 10.0 };

const forAction = (action: ControlAction) =>
  filter<ControlAction>((incoming) => incoming === action);

interface ViewModel {
  factor: number;
  value: number;
  maximum: number;
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

    const routeSettings$ = this.route.paramMap.pipe(
      map(
        (paramMap) =>
          ({
            maximum: parseFloat(paramMap.get('maximum') as string) || defaultSettings.maximum,
            time: parseFloat(paramMap.get('time') as string) || defaultSettings.time,
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
    ).pipe(shareReplay(1));

    const controlActions$ = fromEvent<
      MessageEvent<ControlAction>,
      ControlAction
    >(controlChannel, 'message', (event) => event.data);

    const spacePressed$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter((event) => event.key === ' ')
    );
    const [start$, stop$] = partition(
      merge(controlActions$.pipe(forAction('startStop')), spacePressed$).pipe(
        // This is essential to make the partition of the observable work.
        // If it's not shareReplayed, the partition re-subscribes, and the count is restarted.
        shareReplay(1)
      ),
      (_, i) => i % 2 === 0
    );
    const escapePressed$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
      filter((event) => event.key === 'Escape')
    );
    const reset$ = merge(
      controlActions$.pipe(forAction('reset')),
      escapePressed$,
      initialReset$
    ).pipe(shareReplay(1));

    this.model$ = settings$.pipe(
      switchMap((settings) =>
        merge(
          start$.pipe(
            switchMap(() => {
              const maximumCount = (settings.time * 1000) / TIME_CHUNK;
              return interval(TIME_CHUNK).pipe(
                takeWhile((count) => count <= maximumCount),
                map((count) => {
                  const factor = count / maximumCount;
                  return {
                    factor,
                    value: settings.maximum * factor,
                    maximum: settings.maximum,
                  } as ViewModel;
                }),
                takeUntil(stop$)
              );
            })
          ),
          reset$.pipe(
            map(
              () =>
                ({
                  factor: 0,
                  value: settings.maximum * 0,
                  maximum: settings.maximum,
                } as ViewModel)
            )
          )
        )
      )
    );
  }
}
