/**
 * Request Validation Middleware for F1 Strategy Optimization Requests
 */
const VALID_COMPOUNDS = new Set(['SOFT', 'MEDIUM', 'HARD', 'INTERMEDIATE', 'WET']);

export function validateStrategyRequest(req, res, next) {
  const body = req.body || {};
  const errors = [];

  // Driver validation
  const driver = body.driver || body.driver_id;
  if (!driver || typeof driver !== 'string' || driver.trim().length === 0) {
    errors.push("Driver identifier ('driver' or 'driver_id') is required.");
  }

  // Circuit validation
  const circuit = body.circuit;
  if (!circuit || typeof circuit !== 'string' || circuit.trim().length === 0) {
    errors.push("Circuit name ('circuit') is required.");
  }

  // Lap validation
  const lap = body.current_lap !== undefined ? body.current_lap : body.lap;
  if (lap === undefined || lap === null || typeof lap !== 'number' || isNaN(lap)) {
    errors.push("Current lap ('current_lap' or 'lap') is required and must be a number.");
  } else if (lap < 0 || lap > 80) {
    errors.push("Current lap must be between 0 and 80.");
  }

  // TyreLife validation
  const tyreLife = body.tyre_life !== undefined ? body.tyre_life : body.tyreLife;
  if (tyreLife === undefined || tyreLife === null || typeof tyreLife !== 'number' || isNaN(tyreLife)) {
    errors.push("Tyre life ('tyre_life' or 'tyreLife') is required and must be a number.");
  } else if (tyreLife < 0 || tyreLife > 60) {
    errors.push("Tyre life must be between 0 and 60.");
  }

  // Compound validation
  const compound = body.compound;
  if (!compound || typeof compound !== 'string' || !VALID_COMPOUNDS.has(compound.toUpperCase())) {
    errors.push(`Compound must be one of: ${Array.from(VALID_COMPOUNDS).join(', ')}.`);
  }

  // Fuel validation
  const fuel = body.estimated_fuel_kg !== undefined ? body.estimated_fuel_kg : body.fuel;
  if (fuel !== undefined && (typeof fuel !== 'number' || isNaN(fuel) || fuel < 0)) {
    errors.push("Fuel level ('estimated_fuel_kg' or 'fuel') must be a number greater than or equal to 0.");
  }

  // Humidity validation
  const humidity = body.humidity;
  if (humidity !== undefined && (typeof humidity !== 'number' || isNaN(humidity) || humidity < 0 || humidity > 100)) {
    errors.push("Humidity must be a number between 0 and 100.");
  }

  // Temperature validation
  const trackTemp = body.track_temp !== undefined ? body.track_temp : body.temperature;
  if (trackTemp !== undefined && (typeof trackTemp !== 'number' || isNaN(trackTemp) || trackTemp < -20 || trackTemp > 80)) {
    errors.push("Track temperature must be a reasonable temperature between -20°C and 80°C.");
  }

  const airTemp = body.air_temp;
  if (airTemp !== undefined && (typeof airTemp !== 'number' || isNaN(airTemp) || airTemp < -20 || airTemp > 80)) {
    errors.push("Air temperature must be a reasonable temperature between -20°C and 80°C.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      requestId: req.id,
      code: 'INVALID_REQUEST',
      message: errors.join(' '),
    });
  }

  next();
}
