from fastapi import APIRouter, Query
from datetime import datetime, timezone
from Person_C.ai import generate_advisory
from Person_C.cache.memory import cache

router = APIRouter()

@router.get("/advisory/{ward_id}", tags=["Citizen"])
async def get_advisory(
    ward_id: int, 
    lang: str = Query("en", description="Supported languages: en, hi, ta, kn, bn")
):
    """
    Returns localized citizen public health advisory.
    Supported languages: en, hi, ta, kn, bn.
    Caches results per (ward_id, lang, hour) to optimize LLM query costs.
    """
    # 1. Generate hourly cache key
    current_hour_str = datetime.now(timezone.utc).strftime("%Y-%m-%d-%H")
    cache_key = f"advisory_{ward_id}_{lang.lower()}_{current_hour_str}"
    
    # 2. Check cache
    cached_val = cache.get(cache_key)
    if cached_val is not None:
        return cached_val
        
    # 3. Call AI LLM generator
    advisory = generate_advisory(ward_id, lang)
    
    # 4. Cache for 1 hour (3600 seconds)
    cache.set(cache_key, advisory, ttl_seconds=3600.0)
    
    return advisory
