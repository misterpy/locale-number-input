import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'number-input';

  inputControl = new FormControl(200.22);

  constructor() {
    this.inputControl.valueChanges.subscribe(value => console.log('value >>>', value));
  }
}
