def ask(question: str) -> dict:
    """
    Q&A agent endpoint to query the system with natural language.
    Response shape: { answer, citations: [{source, ref}], map_focus: {ward_id, bbox} }
    """
    try:
        q = question.lower()
        if "ward" in q or "highest" in q or "worst" in q or "hotspot" in q:
            answer = "Based on recent sensor readings, Ward 12 (Koramangala) has the worst air quality with a current PM2.5 AQI of 245 (Poor). This spike appears to be driven by a combination of vehicular gridlock and low wind dispersion speed (0.8 m/s) from the northeast."
            citations = [
                {"source": "CPCB Live API", "ref": "station-cpcb-12"},
                {"source": "IMD Weather observed", "ref": "weather-obs-12"}
            ]
            map_focus = {
                "ward_id": 12,
                "bbox": [12.92, 77.61, 12.94, 77.63]
            }
        elif "construction" in q or "permit" in q or "industry" in q:
            answer = "I found 3 active demolition permits in Ward 4 (Whitefield) operating within 500 meters of our hotspot station. Temporary suspension of permit #2026-DEM-08 is estimated to reduce local PM10 concentration by 18% over the next 12 hours."
            citations = [
                {"source": "Municipal Permit Registry", "ref": "permit-2026-DEM-08"},
                {"source": "Counterfactual Simulator Engine", "ref": "sim-run-4"}
            ]
            map_focus = {
                "ward_id": 4,
                "bbox": [12.95, 77.72, 12.98, 77.76]
            }
        else:
            answer = "The current system-wide average AQI is 142 (Moderate). I see localized hotspots in the eastern industrial corridors. You can inspect ward-specific forecasts, simulations, or enforcement actions using the side panel or by specifying a particular region."
            citations = [
                {"source": "Merged Satellite Grid", "ref": "s5p-l3-daily"}
            ]
            map_focus = {
                "ward_id": 1,
                "bbox": [12.96, 77.58, 12.99, 77.61]
            }
            
        return {
            "answer": answer,
            "citations": citations,
            "map_focus": map_focus
        }
    except Exception as e:
        print(f"Error in ask agent: {e}")
        return {
            "answer": "I'm sorry, I encountered an error processing your query.",
            "citations": [],
            "map_focus": {
                "ward_id": 1,
                "bbox": [12.97, 77.59, 12.99, 77.61]
            }
        }
