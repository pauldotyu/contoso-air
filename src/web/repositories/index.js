const airportsJSON = require("../data/airports.json");
const destinationsJSON = require("../data/destinations");
const dealsJSON = require("../data/deals");
const flightsJSON = require("../data/flights");
const _BookRepository = require("./book.repository");
const _BookMemoryRepository = require("./book.memory.repository");
const _FlightsRepository = require("./flights.repository");
const { setConfigured, getStatus: getDbStatus } = require("./db.status");

let bookRepository = null;
// Helper: detect if CosmosDB configuration is present
const isCosmosConfigured = () => {
  const listConnectionStringUrl =
    process.env.AZURE_COSMOS_LISTCONNECTIONSTRINGURL;
  const scope = process.env.AZURE_COSMOS_SCOPE;
  const clientId = process.env.AZURE_COSMOS_CLIENTID;
  const configured = !!(listConnectionStringUrl && scope && clientId);
  const missingEnv = [];
  if (!listConnectionStringUrl) missingEnv.push("AZURE_COSMOS_LISTCONNECTIONSTRINGURL");
  if (!scope) missingEnv.push("AZURE_COSMOS_SCOPE");
  if (!clientId) missingEnv.push("AZURE_COSMOS_CLIENTID");
  setConfigured(configured, missingEnv);
  return configured;
};

const AirportsRepository = () => airportsJSON;
const DestinationsRepository = () => destinationsJSON;
const DealsRepository = () => dealsJSON;
const BookRepository = () => {
  if (!bookRepository) {
    const listConnectionStringUrl =
      process.env.AZURE_COSMOS_LISTCONNECTIONSTRINGURL;
    const scope = process.env.AZURE_COSMOS_SCOPE;
    const clientId = process.env.AZURE_COSMOS_CLIENTID;

    if (listConnectionStringUrl && scope && clientId) {
      console.log(
        "Azure CosmosDB settings found. Booking functionality enabled."
      );
      bookRepository = new _BookRepository({
        listConnectionStringUrl,
        scope,
        clientId,
      });
    } else {
      console.warn(
        "Azure CosmosDB settings not found. Using in-memory booking repository."
      );
      bookRepository = new _BookMemoryRepository();
    }
  }

  return bookRepository;
};
const FlightsRepository = () => new _FlightsRepository(flightsJSON);

module.exports = {
  AirportsRepository,
  DestinationsRepository,
  DealsRepository,
  BookRepository,
  FlightsRepository,
  isCosmosConfigured,
  getDbStatus,
};
