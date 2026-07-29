import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.linear_model import LinearRegression

# Ensure cache and models directories exist
os.makedirs('cache', exist_ok=True)
os.makedirs('models', exist_ok=True)

# Complete 24-race F1 Season Track Laps
TRACK_LAPS = {
    'Bahrain': 57, 'Saudi Arabia': 50, 'Australia': 58, 'Japan': 53, 'China': 56,
    'Miami': 57, 'Imola': 63, 'Monaco': 78, 'Canada': 70, 'Spain': 66,
    'Austria': 71, 'Silverstone': 52, 'Hungary': 70, 'Belgium': 44, 'Netherlands': 72,
    'Monza': 53, 'Azerbaijan': 51, 'Singapore': 62, 'USA': 56, 'Mexico': 71,
    'Brazil': 71, 'Las Vegas': 50, 'Qatar': 57, 'Abu Dhabi': 58
}

CIRCUIT_NAME_MAPPING = {
    'Bahrain Grand Prix': 'Bahrain',
    'Saudi Arabian Grand Prix': 'Saudi Arabia',
    'Australian Grand Prix': 'Australia',
    'Japanese Grand Prix': 'Japan',
    'Chinese Grand Prix': 'China',
    'Miami Grand Prix': 'Miami',
    'Emilia Romagna Grand Prix': 'Imola',
    'Monaco Grand Prix': 'Monaco',
    'Canadian Grand Prix': 'Canada',
    'Spanish Grand Prix': 'Spain',
    'Austrian Grand Prix': 'Austria',
    'British Grand Prix': 'Silverstone',
    'Hungarian Grand Prix': 'Hungary',
    'Belgian Grand Prix': 'Belgium',
    'Dutch Grand Prix': 'Netherlands',
    'Italian Grand Prix': 'Monza',
    'Azerbaijan Grand Prix': 'Azerbaijan',
    'Singapore Grand Prix': 'Singapore',
    'United States Grand Prix': 'USA',
    'Mexico City Grand Prix': 'Mexico',
    'São Paulo Grand Prix': 'Brazil',
    'Las Vegas Grand Prix': 'Las Vegas',
    'Qatar Grand Prix': 'Qatar',
    'Abu Dhabi Grand Prix': 'Abu Dhabi'
}

TEAM_MAPPING = {
    'Red Bull Racing': 'Red Bull',
    'Mercedes': 'Mercedes',
    'Ferrari': 'Ferrari',
    'McLaren': 'McLaren',
    'Aston Martin': 'Aston Martin'
}

COMPOUNDS = ['SOFT', 'MEDIUM', 'HARD']
TEAMS = ['Mercedes', 'Red Bull', 'Ferrari', 'McLaren', 'Aston Martin', 'Other']

# Standard Pirelli compound offsets and wear multipliers for missing combinations
DEFAULT_COMPOUND_SLOPES = {'SOFT': 0.045, 'MEDIUM': 0.025, 'HARD': 0.015}
DEFAULT_COMPOUND_OFFSETS = {'SOFT': -0.7, 'MEDIUM': 0.0, 'HARD': 0.6}

def load_master_dataset():
    """Load common ground dataset fetched from ai-agent data store."""
    possible_paths = [
        Path('../ai-agent/data/dataset.parquet'),
        Path('../ai-agent/data/dataset.csv'),
        Path('../ai-agent/datasets/master.parquet'),
        Path('../ai-agent/data/dataset_2024.parquet')
    ]
    for path in possible_paths:
        if path.exists():
            print(f"Loading common dataset from ai-agent: {path}")
            if path.suffix == '.parquet':
                return pd.read_parquet(path)
            elif path.suffix == '.csv':
                return pd.read_csv(path)
    return None

def prepare_data():
    deg_data = {}
    pit_time_avg = 22.0

    df = load_master_dataset()
    if df is not None and not df.empty:
        print(f"Dataset successfully loaded! Total laps: {len(df)}")
        df['TrackClean'] = df['Circuit'].map(CIRCUIT_NAME_MAPPING).fillna(df['Circuit'])
        df['TeamClean'] = df['Team'].map(TEAM_MAPPING).fillna('Other')
        df['CompoundClean'] = df['Compound'].astype(str).str.upper()

        for track in TRACK_LAPS.keys():
            track_df = df[df['TrackClean'] == track]
            if track_df.empty:
                continue

            deg_data[track] = {}
            for team in TEAMS:
                deg_data[track][team] = {}
                team_df = track_df[track_df['TeamClean'] == team]
                
                for comp in COMPOUNDS:
                    comp_df = team_df[team_df['CompoundClean'] == comp]
                    
                    # Fallback to all team laps for this track if team specific laps are low
                    if len(comp_df) < 3:
                        comp_df = track_df[track_df['CompoundClean'] == comp]
                    
                    if len(comp_df) >= 3:
                        med_time = comp_df['LapTimeSeconds'].median()
                        valid = comp_df[
                            (comp_df['LapTimeSeconds'] >= med_time * 0.90) &
                            (comp_df['LapTimeSeconds'] <= med_time * 1.15) &
                            (comp_df['TyreLife'] >= 1)
                        ]
                        if len(valid) >= 3:
                            # Use ApproxFuelCorrectedLapTime if available to isolate tyre wear from fuel burn
                            target_col = 'ApproxFuelCorrectedLapTime' if 'ApproxFuelCorrectedLapTime' in valid.columns else 'LapTimeSeconds'
                            X = valid[['TyreLife']].values
                            y = valid[target_col].values
                            reg = LinearRegression().fit(X, y)
                            base = float(reg.intercept_)
                            slope = float(max(0.008, reg.coef_[0]))
                            
                            # Enforce realistic relative compound degradation order
                            if comp == 'SOFT':
                                slope = max(slope, 0.040)
                            elif comp == 'MEDIUM':
                                slope = max(slope, 0.022)
                            elif comp == 'HARD':
                                slope = max(slope, 0.012)

                            deg_data[track][team][comp] = {
                                'base': round(base, 2),
                                'slope': round(slope, 4)
                            }

    # Fill in track defaults for any missing tracks or compound entries
    print("\nEnsuring 100% circuit & team coverage across all 24 calendar tracks...")
    for track, total_laps in TRACK_LAPS.items():
        if track not in deg_data:
            deg_data[track] = {}
            
        # Determine track baseline lap time
        track_bases = []
        for tm in deg_data[track]:
            for cp in deg_data[track][tm]:
                track_bases.append(deg_data[track][tm][cp]['base'])
        
        base_medium = np.mean(track_bases) if track_bases else (85.0 if 'Monza' in track else 82.0 if 'Monaco' in track else 93.0)

        for team in TEAMS:
            if team not in deg_data[track]:
                deg_data[track][team] = {}

            for comp in COMPOUNDS:
                if comp not in deg_data[track][team]:
                    comp_base = base_medium + DEFAULT_COMPOUND_OFFSETS[comp]
                    comp_slope = DEFAULT_COMPOUND_SLOPES[comp]
                    deg_data[track][team][comp] = {
                        'base': round(comp_base, 2),
                        'slope': round(comp_slope, 4)
                    }

    # Save artifacts
    joblib.dump(deg_data, 'models/deg_models.pkl')
    joblib.dump(pit_time_avg, 'models/pit_time.pkl')
    joblib.dump(TRACK_LAPS, 'models/track_laps.pkl')

    print(f"\nData preparation complete!")
    print(f"Polished degradation models saved to 'models/deg_models.pkl' ({len(deg_data)} tracks covered).")

if __name__ == "__main__":
    prepare_data()