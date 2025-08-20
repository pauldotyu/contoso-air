#!/usr/bin/env node
/*
  Cleanup script for src/web/data/airports.json
  - Removes duplicate city entries (per city+country; keeps the first)
  - Adds a "state" property; fills for United States cities when known

  Usage: node scripts/cleanup-airports.js
*/
const fs = require('fs');
const path = require('path');

const airportsPath = path.resolve(__dirname, '../src/web/data/airports.json');

function loadAirports() {
  const raw = fs.readFileSync(airportsPath, 'utf8');
  return JSON.parse(raw);
}

// Basic US city -> state abbreviation mapping (extend as needed)
const US_CITY_TO_STATE = new Map([
  // AK
  ['anchorage','AK'], ['fairbanks','AK'], ['bethel','AK'], ['kaktovik','AK'], ['unalaska','AK'], ['tok','AK'], ['arctic village','AK'], ['king salmon','AK'], ['dillingham','AK'], ['cordova','AK'], ['kenai','AK'], ['kodiak','AK'], ['eek','AK'], ['alakanuk','AK'], ['wainwright','AK'], ['ambler','AK'], ['aniak','AK'], ['anaktuvuk pass','AK'], ['atka','AK'], ['cold bay','AK'], ['chisana','AK'], ['circle','AK'], ['chefornak','AK'], ['chuathbaluk','AK'], ['crooked creek','AK'], ['deering','AK'], ['edna bay','AK'], ['elfin cove','AK'],
  // AL
  ['birmingham','AL'], ['dothan','AL'],
  // AR
  ['little rock','AR'],
  // AZ
  ['phoenix','AZ'], ['tucson','AZ'], ['flagstaff','AZ'],
  // CA
  ['los angeles','CA'], ['oakland','CA'], ['san francisco','CA'], ['san jose','CA'], ['san diego','CA'], ['sacramento','CA'], ['long beach','CA'], ['burbank','CA'], ['fresno','CA'], ['irvine','CA'], ['carlsbad','CA'], ['chico','CA'], ['crescent city','CA'], ['mckinleyville','CA'],
  // CO
  ['denver','CO'], ['colorado springs','CO'], ['gypsum','CO'], ['aspen','CO'], ['cortez','CO'],
  // CT
  ['hartford','CT'], ['windsor locks','CT'],
  // DC
  ['washington','DC'],
  // DE
  ['wilmington','DE'],
  // FL
  ['miami','FL'], ['orlando','FL'], ['tampa','FL'], ['jacksonville','FL'], ['fort lauderdale','FL'], ['dania beach','FL'], ['key west','FL'], ['fort myers','FL'], ['bartow','FL'], ['naples','FL'],
  // GA
  ['atlanta','GA'], ['brunswick','GA'],
  // HI
  ['honolulu','HI'], ['kahului','HI'], ['lihue','HI'], ['hilo','HI'],
  // IA
  ['des moines','IA'], ['cedar rapids','IA'], ['dubuque','IA'], ['fort dodge','IA'],
  // ID
  ['boise','ID'],
  // IL
  ['chicago','IL'], ['bloomington','IL'], ['savoy','IL'], ['decatur','IL'],
  // IN
  ['indianapolis','IN'],
  // KS
  ['wichita','KS'],
  // KY
  ['louisville','KY'], ['hebron','KY'],
  // LA
  ['baton rouge','LA'], ['alexandria','LA'],
  // MA
  ['boston','MA'], ['new bedford','MA'],
  // MD
  ['baltimore','MD'],
  // ME
  ['bangor','ME'], ['ellsworth','ME'],
  // MI
  ['detroit','MI'], ['flint','MI'], ['hancock','MI'], ['kincheloe','MI'],
  // MN
  ['bemidji','MN'], ['duluth','MN'], ['brainerd','MN'],
  // MO
  ['st. louis','MO'], ['kansas city','MO'], ['scott city','MO'],
  // MS
  ['jackson','MS'],
  // MT
  ['billings','MT'], ['kalispell','MT'], ['bozeman','MT'],
  // NC
  ['charlotte','NC'],
  // ND
  ['fargo','ND'], ['bismarck','ND'], ['dickinson','ND'],
  // NE
  ['kearney','NE'],
  // NH
  ['manchester','NH'],
  // NJ
  ['newark','NJ'], ['egg harbor city','NJ'], ['fairfield','NJ'],
  // NM
  ['albuquerque','NM'], ['alamogordo','NM'],
  // NV
  ['las vegas','NV'], ['reno','NV'], ['ely','NV'],
  // NY
  ['new york','NY'], ['rochester','NY'], ['syracuse','NY'], ['buffalo','NY'], ['elmira','NY'],
  // OH
  ['columbus','OH'], ['cleveland','OH'], ['cincinnati','OH'], ['dayton','OH'], ['akron','OH'],
  // OK
  ['oklahoma city','OK'], ['tulsa','OK'],
  // OR
  ['portland','OR'], ['eugene','OR'],
  // PA
  ['philadelphia','PA'], ['pittsburgh','PA'], ['harrisburg','PA'], ['allentown','PA'], ['scranton','PA'], ['reynoldsville','PA'],
  // PR
  ['aguadilla','PR'], ['culebra','PR'],
  // RI
  ['block island','RI'],
  // SC
  ['charleston','SC'], ['columbia','SC'], ['florence','SC'],
  // SD
  ['sioux falls','SD'], ['watertown','SD'], ['aberdeen','SD'],
  // TN
  ['nashville','TN'],
  // TX
  ['dallas','TX'], ['houston','TX'], ['san antonio','TX'], ['austin','TX'], ['el paso','TX'], ['amarillo','TX'], ['midland','TX'], ['odessa','TX'], ['brownsville','TX'], ['beaumont','TX'], ['college station','TX'], ['abilene','TX'], ['waco','TX'], ['del rio','TX'], ['corpus christi','TX'],
  // UT
  ['cedar city','UT'], ['thompson','UT'],
  // VA
  ['arlington','VA'], ['earlysville','VA'],
  // VT
  ['burlington','VT'],
  // WA
  ['seattle','WA'], ['bellingham','WA'], ['east wenatchee','WA'], ['eastsound','WA'], ['newport','WA'],
  // WI
  ['eau claire','WI'], ['mosinee','WI'],
  // WV
  ['charleston','WV'], ['clarksburg','WV'],
  // WY
  ['cheyenne','WY'], ['cody/yellowstone','WY'],
]);

function determineUSState(city) {
  if (!city) return '';
  const key = String(city).trim().toLowerCase();
  return US_CITY_TO_STATE.get(key) || '';
}

function normalizeStr(v) {
  return String(v || '').trim();
}

function cleanAirports(list) {
  const seen = new Set();
  const output = [];
  let removed = 0;
  let filledStates = 0;

  for (const item of list) {
    const city = normalizeStr(item.city);
    const country = normalizeStr(item.country);

    let state = '';
    if (!country || /united states/i.test(country)) {
      state = determineUSState(city);
      if (state) filledStates++;
    }

    const countryForKey = country || (state ? 'United States' : '');
    const key = `${city.toLowerCase()}|${countryForKey.toLowerCase()}`;

    if (seen.has(key)) {
      removed++;
      continue; // drop duplicate city entry in same country
    }
    seen.add(key);

    const cleaned = {
      ...item,
      state, // add state (empty string when unknown/non-US)
    };
    output.push(cleaned);
  }

  return { output, removed, filledStates };
}

function main() {
  const airports = loadAirports();
  if (!Array.isArray(airports)) {
    console.error('airports.json does not contain a top-level array. Aborting.');
    process.exit(1);
  }

  const before = airports.length;
  const { output, removed, filledStates } = cleanAirports(airports);
  const after = output.length;

  // Pretty-print with 2 spaces
  fs.writeFileSync(airportsPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

  console.log(`Airports cleaned: ${before} -> ${after} (removed duplicates: ${removed}). States filled (US): ${filledStates}.`);
}

main();
