// Simple shared status holder for CosmosDB connectivity and configuration
// This module is a singleton across the app process.

const status = {
  configured: false,
  connected: false,
  missingEnv: [],
  lastError: null,
  lastCheckedAt: null,
};

const setConfigured = (configured, missingEnv = []) => {
  status.configured = !!configured;
  status.missingEnv = Array.isArray(missingEnv) ? missingEnv : [];
  status.lastCheckedAt = new Date();
};

const setConnected = (connected) => {
  status.connected = !!connected;
  status.lastCheckedAt = new Date();
};

const setError = (error) => {
  status.lastError = error ? String(error.stack || error.message || error) : null;
  status.lastCheckedAt = new Date();
};

const getStatus = () => ({ ...status });

module.exports = { getStatus, setConfigured, setConnected, setError };
