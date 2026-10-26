import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'duration' })
export class DurationPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    const total = Math.max(0, Math.floor(value ?? 0));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
