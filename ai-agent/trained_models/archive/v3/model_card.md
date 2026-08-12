# Model Card: ApexData Tyre Degradation Predictor (v3)

## Model Overview
- **Model Identifier**: `tyre_model_v3`
- **Model Type**: Gradient Boosted Decision Trees (`XGBoostRegressor`)
- **Trained Date**: `2026-08-09T23:12:57.283603`
- **Target Variable**: `TargetNextLapTime` (Next lap duration in seconds)

## Intended Use
- **Primary Task**: Predict short-term tyre degradation and next lap pace for Formula 1 strategy optimization.
- **Consumers**: ApexData FastAPI AI Engine & Race Strategy Simulator.

## Training Dataset & Scope
- **Dataset Size**: 52382 samples across 42565 training and 9817 test samples.
- **Features Used (14 features)**:
  `CompoundEncoded, TyreLife, LapNumber, EstimatedFuelLoad, ApproxFuelCorrectedLapTime, TrackTemp, AirTemp, Humidity, Pressure, RollingAvgPace3, RollingAvgPace5, LapTimeDelta, RaceProgress, StintProgress`

## Performance Metrics (Hold-out Test Set)
- **RMSE**: `0.8069 s`
- **MAE**: `0.496 s`
- **R² Score**: `0.9952`
- **MAPE**: `0.5613%`

## Cross-Validation (5-Fold Leak-Free GroupKFold)
- **Mean CV RMSE**: `1.0735 s`
- **Mean CV R²**: `0.9846`

## Best Hyperparameters
```json
{
  "subsample": 0.8,
  "n_estimators": 300,
  "min_child_weight": 1,
  "max_depth": 3,
  "learning_rate": 0.1,
  "colsample_bytree": 1.0
}
```

## Known Limitations
- Model performance relies on clean green flag laps; non-representative laps (SC/VSC/yellow flags) must be filtered prior to inference.
- Extreme weather shifts (sudden heavy rain) require specialized wet tyre pace scaling.
