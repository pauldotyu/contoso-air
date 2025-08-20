class BookFlightsMemoryRepository {
  constructor() {
    this._store = new Map(); // user -> { user, booked, purchased: [] }
  }

  async getUserInfo(username) {
    const existing = this._store.get(username);
    return (
      existing || {
        user: username,
        booked: null,
        purchased: [],
      }
    );
  }

  async createOrUpdateUserInfo(userInfo) {
    // clone to avoid accidental mutations
    const clone = JSON.parse(JSON.stringify(userInfo));
    this._store.set(userInfo.user, clone);
  }
}

module.exports = BookFlightsMemoryRepository;
