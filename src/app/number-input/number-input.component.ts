import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import numeral from 'numeral';
import * as de_locale from 'numeral/locales/de';

@Component({
  selector: 'app-number-input',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: NumberInputComponent,
    multi: true
  }],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss']
})
export class NumberInputComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() set language(value: 'en' | 'de') {
    this.lang = value || 'en';
    numeral.locale(this.lang);
  }

  onChange;
  lang: 'en' | 'de' = 'en';
  value: number = null;
  inputControl: FormControl = new FormControl();

  private destroyed$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    numeral.register('locale', 'de', {
      ...de_locale,
      delimiters: {
        thousands: '.',
        decimal: ','
      },
    });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  ngOnInit(): void {
    this.inputControl.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroyed$),
      )
      .subscribe(value => {
        if (value === null && value !== this.value) {
          this.onChange(this.value);
          return;
        }

        const ifChanged = this.value !== this.toNumber(value);

        if (isNaN(Number(value))) {
          if (ifChanged) {
            this.value = this.toNumber(value);
            this.inputControl.setValue(this.toFormatted(this.toNumber(value)));
            this.onChange(this.value);
          }
        } else {
          if (ifChanged) {
            this.value = this.toNumber(value);
            this.inputControl.setValue(this.toFormatted(this.value));
            this.onChange(this.value);
          }
        }
      });
  }

  writeValue(value: number): void {
    if (value === null || undefined) {
      this.value = null;
      this.inputControl.setValue(null);
      return;
    }

    this.value = this.toNumber(Number(value));
    this.inputControl.setValue(this.toFormatted(this.value));
  }

  registerOnTouched(fn: any): void {
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private toFormatted(value: string | number): string {
    return numeral(value).format('0,0.00');
  }

  private toNumber(value: string | number): number {
    return numeral(value).value();
  }
}
