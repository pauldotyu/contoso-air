#!/usr/bin/env node
/*
  Fix script for src/web/data/airports.json
  - For entries that represent US airports (have a 2-letter state code)
    and have missing/blank country, set country to "United States".

  Usage: node scripts/fix-us-country.js
*/
const fs = require('fs');
const path = require('path');

const airportsPath = path.resolve(__dirname, '../src/web/data/airports.json');

const US_STATE_CODES = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DC','DE','FL','GA','HI','IA','ID','IL','IN','KS','KY','LA','MA','MD','ME','MI','MN','MO','MS','MT','NC','ND','NE','NH','NJ','NM','NV','NY','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VA','VT','WA','WI','WV',
  // territories often used in IATA datasets
  'PR','GU','VI','AS','MP'
]);

function loadAirports() {
  const raw = fs.readFileSync(airportsPath, 'utf8');
  return JSON.parse(raw);
}

function isBlank(v){
  return v === undefined || v === null || String(v).trim() === '';
}

function main(){
  const airports = loadAirports();
  if(!Array.isArray(airports)){
    console.error('airports.json does not contain a top-level array. Aborting.');
    process.exit(1);
  }

  let updated = 0;
  for(const a of airports){
    const state = (a.state || '').trim().toUpperCase();
    if(state && US_STATE_CODES.has(state)){
      if(isBlank(a.country)){
        a.country = 'United States';
        updated++;
      }
    }
  }

  fs.writeFileSync(airportsPath, JSON.stringify(airports, null, 2) + '\n', 'utf8');
  console.log(`US country set on ${updated} airports.`);
}

main();
