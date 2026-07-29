# Model Card: ApexData Tyre Degradation Predictor (v1)

## Model Overview
- **Model Identifier**: `tyre_model_v1`
- **Model Type**: Gradient Boosted Decision Trees (`XGBoostRegressor`)
- **Trained Date**: `2026-07-28T23:48:05.080926`
- **Target Variable**: `TargetNextLapTime` (Next lap duration in seconds)

## Intended Use
- **Primary Task**: Predict short-term tyre degradation and next lap pace for Formula 1 strategy optimization.
- **Consumers**: ApexData FastAPI AI Engine & Race Strategy Simulator.

## Training Dataset & Scope
- **Dataset Size**: 21763 samples across 17553 training and 4210 test samples.
- **Features Used (14 features)**:
  `CompoundEncoded, TyreLife, LapNumber, EstimatedFuelLoad, ApproxFuelCorrectedLapTime, TrackTemp, AirTemp, Humidity, Pressure, RollingAvgPace3, RollingAvgPace5, LapTimeDelta, RaceProgress, StintProgress`

## Performance Metrics (Hold-out Test Set)
- **RMSE**: `0.8589 s`
- **MAE**: `0.6261 s`
- **R² Score**: `0.9798`
- **MAPE**: `0.6927%`

## Cross-Validation (5-Fold Leak-Free GroupKFold)
- **Mean CV RMSE**: `1.4942 s`
- **Mean CV R²**: `0.9663`

## Best Hyperparameters
```json
{
  "subsample": 0.9,
  "n_estimators": 300,
  "min_child_weight": 5,
  "max_depth": 3,
  "learning_rate": 0.1,
  "colsample_bytree": 0.7
}
```

## Known Limitations
- Model performance relies on clean green flag laps; non-representative laps (SC/VSC/yellow flags) must be filtered prior to inference.
- Extreme weather shifts (sudden heavy rain) require specialized wet tyre pace scaling.
