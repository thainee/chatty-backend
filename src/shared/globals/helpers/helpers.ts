export class Helers {
  static toFirstLetterUpperCase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
  }
}
