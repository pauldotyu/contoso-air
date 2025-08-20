const { v4: uuidv4 } = require("uuid");
const MemoryRepo = require("../repositories/book.memory.repository");

const getRandomSeat = function (cols = "ABCDEF", rows = 32) {
  var col = cols[Math.floor(Math.random() * cols.length)];
  var row = Math.floor(Math.random() * rows) + 1;
  return row + "" + col;
};

const getNextSeat = function (seat, cols = "ABCDEF") {
  const col = (cols.indexOf(seat.substr(-1)) + 1) % cols.length;
  if (col != 0) return seat.slice(0, -1) + cols[col];
  const row = parseInt(seat.slice(0, -1)) + 1;
  return row + cols[col];
};

const segmentParser = function (s, airports, passengers) {
  const seats = [getRandomSeat()];
  for (let i = 1; i < passengers; i++) {
    seats.push(getNextSeat(seats[i - 1]));
  }

  return {
    flight: s.flight,
    fromCode: s.fromCode,
    fromCity: airports.getByCode(s.fromCode).city,
    toCode: s.toCode,
    toCity: airports.getByCode(s.toCode).city,
    seats,
    departTime: s.departTime,
    arrivalTime: s.arrivalTime,
  };
};

const flightParser = function (flight, airports, passengers) {
  return {
    duration: flight.duration,
    price: flight.price,
    fromCode: flight.fromCode,
    toCode: flight.toCode,
    segments: flight.segments.map((s) =>
      segmentParser(s, airports, passengers)
    ),
  };
};

class BookService {
  constructor(bookRepository, airports) {
    // Fallback to in-memory repository if none is configured
    this._repo = bookRepository || null;
    this._mem = new MemoryRepo();
    this._airports = airports;
  }

  async getFlights(username) {
    let userInfo;
    try {
      userInfo = this._repo
        ? await this._repo.getUserInfo(username)
        : await this._mem.getUserInfo(username);
    } catch (e) {
      userInfo = await this._mem.getUserInfo(username);
    }
    return userInfo.purchased.map((p) =>
      Object.assign({}, p, {
        total: (p.parting.price + p.returning.price) * p.passengers,
      })
    );
  }

  async getBooked(username) {
    let userInfo;
    try {
      userInfo = this._repo
        ? await this._repo.getUserInfo(username)
        : await this._mem.getUserInfo(username);
    } catch (e) {
      userInfo = await this._mem.getUserInfo(username);
    }
    return userInfo.booked;
  }

  async getFlightById(username, id) {
    const purchased = await this.getFlights(username);
    return purchased.find((f) => f.id == id);
  }

  async bookFlight(username, parting, returning, passengers) {
    let userInfo;
    try {
      userInfo = this._repo
        ? await this._repo.getUserInfo(username)
        : await this._mem.getUserInfo(username);
    } catch (e) {
      userInfo = await this._mem.getUserInfo(username);
    }
    userInfo.booked = {
      id: uuidv4(),
      passengers,
      parting: flightParser(parting, this._airports, passengers),
      returning: flightParser(returning, this._airports, passengers),
    };

    try {
      if (this._repo) await this._repo.createOrUpdateUserInfo(userInfo);
      else await this._mem.createOrUpdateUserInfo(userInfo);
    } catch (e) {
      await this._mem.createOrUpdateUserInfo(userInfo);
    }
    return userInfo.booked.id;
  }

  async purchase(username) {
    let userInfo;
    try {
      userInfo = this._repo
        ? await this._repo.getUserInfo(username)
        : await this._mem.getUserInfo(username);
    } catch (e) {
      userInfo = await this._mem.getUserInfo(username);
    }
    if (!userInfo.booked) return null;

    const id = userInfo.booked.id;
    userInfo.purchased.push(userInfo.booked);
    userInfo.booked = null;
    try {
      if (this._repo) await this._repo.createOrUpdateUserInfo(userInfo);
      else await this._mem.createOrUpdateUserInfo(userInfo);
    } catch (e) {
      await this._mem.createOrUpdateUserInfo(userInfo);
    }
    return id;
  }
}

module.exports = BookService;
