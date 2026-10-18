/** The few lines every security journey reports with: a check, and the end. */
let checks = 0;
let failures = 0;

export function check(what: string, got: unknown, want: unknown): void {
  checks += 1;
  if (JSON.stringify(got) === JSON.stringify(want)) {
    console.log(`PASS: ${what}`);
    return;
  }
  failures += 1;
  console.log(`FAIL: ${what}\n      expected ${JSON.stringify(want)}\n      got      ${JSON.stringify(got)}`);
}

export function finish(): void {
  console.log(failures ? `${checks} checks, ${failures} failing.` : `${checks} checks, all passing.`);
  process.exit(failures ? 1 : 0);
}
