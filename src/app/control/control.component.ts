import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { filter, fromEvent, tap } from 'rxjs';
import { ControlAction } from 'src/app/controlAction';

@Component({
  selector: 'app-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
})
export class ControlComponent {
  private settingsChannel = new BroadcastChannel('auction-settings');
  private controlChannel = new BroadcastChannel('auction-control');

  public keys$ = fromEvent<KeyboardEvent>(window, 'keydown').pipe(
    tap((event) => {
      if (event.key === ' ') {
        event?.preventDefault();
        this.controlAction('startStop');
      } else if (event.key === 'Escape') {
        event?.preventDefault();
        this.controlAction('reset');
      }
    })
  );

  updateSettings(ngForm: NgForm) {
    if (ngForm.valid) {
      this.settingsChannel.postMessage(ngForm.value);
    }
  }

  controlAction(action: ControlAction) {
    this.controlChannel.postMessage(action);
  }
}
