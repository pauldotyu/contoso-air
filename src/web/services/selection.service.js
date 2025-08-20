class SelectionService {
  constructor(cookieName = "ca_pending") {
    this.cookieName = cookieName;
  }

  // Save a compact pending selection for unauthenticated users
  savePending(req, res, selection) {
    if (!req || !res) return;
    if (req.session) req.session.pendingSelection = selection;
    res.cookie(this.cookieName, JSON.stringify(selection), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
  }

  // Load pending selection from session or cookie
  loadPending(req) {
    if (!req) return null;
    let sel = req.session && req.session.pendingSelection;
    if (!sel && req.cookies && req.cookies[this.cookieName]) {
      try {
        sel = JSON.parse(req.cookies[this.cookieName]);
      } catch (_) {
        sel = null;
      }
    }
    return sel || null;
  }

  // Clear pending selection
  clearPending(req, res) {
    if (req?.session) delete req.session.pendingSelection;
    if (res) res.clearCookie(this.cookieName);
  }
}

module.exports = SelectionService;
