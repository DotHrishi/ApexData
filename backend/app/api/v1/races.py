from fastapi import APIRouter, HTTPException
import fastf1

router=APIRouter(prefix="/races", tags=["Races"])

@router.get("/{year}/{round}")
def get_race(year: int, round: int):
    try:
        session=fastf1.get_session(year, round, "R")
        session.load()
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
    
    if session.results is None or session.results.empty:
        raise HTTPException(status_code=404, detail="No Results Available")
    
    return {
        "event": session.event.EventName,
        "circuit": session.event.Location,
        "drivers": list(session.drivers),
        "winner": session.results.iloc[0]["FullName"]
    }