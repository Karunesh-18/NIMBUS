def generate_advisory(ward_id: int, lang: str) -> dict:
    """
    Returns localized citizen public health advisory.
    Supported languages: en, hi, ta, kn, bn
    Response shape: { ward_id, message, risk_level }
    """
    try:
        advisories = {
            "en": {
                "message": "Stay indoors as much as possible. Air quality is currently poor, especially for vulnerable groups.",
                "risk_level": "Poor"
            },
            "hi": {
                "message": "जितना हो सके घर के अंदर रहें। हवा की गुणवत्ता वर्तमान में खराब है, खासकर संवेदनशील समूहों के लिए।",
                "risk_level": "खराब (Poor)"
            },
            "ta": {
                "message": "முடிந்தவரை வீட்டிற்குள்ளேயே இருக்கவும். காற்றின் தரம் தற்போது மோசமாக உள்ளது, குறிப்பாக பாதிக்கப்படக்கூடிய குழுக்களுக்கு.",
                "risk_level": "மோசம் (Poor)"
            },
            "kn": {
                "message": "ಸಾಧ್ಯವಾದಷ್ಟು ಮನೆಯೊಳಗೆ ಇರಿ. ಗಾಳಿಯ ಗುಣಮಟ್ಟವು ಪ್ರಸ್ತುತ ಕಳಪೆಯಾಗಿದೆ, ವಿಶೇಷವಾಗಿ ದುರ್ಬಲ ಗುಂಪುಗಳಿಗೆ.",
                "risk_level": "ಕಳಪೆ (Poor)"
            },
            "bn": {
                "message": "যতটা সম্ভব ঘরের ভেতরে থাকুন। বাতাসের মান বর্তমানে খারাপ, বিশেষ করে দুর্বল জনগোষ্ঠীর জন্য।",
                "risk_level": "খারাপ (Poor)"
            }
        }
        
        # Default to English if language is unsupported
        selected = advisories.get(lang.lower(), advisories["en"])
        
        return {
            "ward_id": ward_id,
            "message": selected["message"],
            "risk_level": selected["risk_level"]
        }
    except Exception as e:
        print(f"Error generating advisory: {e}")
        return {
            "ward_id": ward_id,
            "message": "Air quality levels are normal. Limit outdoor activities if you experience discomfort.",
            "risk_level": "Moderate"
        }
