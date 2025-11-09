import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, limit: number = 20, separator: string = '\n'): string {
    if (!value) return value;

    let wrappedText = '';
    let start = 0;

    while (start < value.length) {
      if (start > 0) {
        wrappedText += separator;
      }
      wrappedText += value.substring(start, start + limit);
      start += limit;
    }

    return wrappedText;
  }

}
