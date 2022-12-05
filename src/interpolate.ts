// Interpolate a string with an object of values.
export function interpolate(str: string, vars: object): string {
  const keys = Object.keys(vars);
  const re = new RegExp(`{ *(${keys.join("|")}) *}`, "g");
  const template = str.replace(/\$\{/, "\\${").replace(re, "${this.$1}");
  const fn = "return `" + template + "`;";
  return new Function(fn).call(vars);
}
