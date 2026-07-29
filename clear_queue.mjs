import { execSync } from 'child_process';

const ids = [
  '511d5e6a', 'b2007569', 'bda07abb', 'c312c652', 'e3328d0d', 'e384e28f', 'f76e3ee5', '627fa883', '6af666c6'
];

for (const id of ids) {
  try {
    console.log(`Clearing ${id}`);
    execSync(`node .claude/skills/impeccable/scripts/live-complete.mjs --id ${id}`);
  } catch (e) {
    console.log(`Failed on ${id}`);
  }
}
