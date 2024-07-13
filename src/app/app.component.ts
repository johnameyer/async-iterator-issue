import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { makeLazyMultiIterable } from './multi-iterator';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'iterator-issue';

  constructor() {
    wrap(makeLazyMultiIterable(generator())).next();
  }
}

function * generator() {
  yield 0;
}

function * wrap<T>(generator: IterableIterator<T>) {
  yield * generator;
}