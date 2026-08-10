export const API_URL = "http://127.0.0.1:8000";

/**
 * Sends polygon geometry to backend for risk analysis.
 * @param {Array} latlngs - Array of objects {lat, lng} from Leaflet
 * @returns {Promise<Object>} - The analysis result
 */
export const analyzeRisk = async (latlngs) => {
    try {
        // Convert Leaflet LatLngs to GeoJSON format (Lon, Lat) !!!
        // Leaflet: {lat: 36.7, lng: -119.4} -> GeoJSON: [-119.4, 36.7]
        const coordinates = latlngs.map(pt => [pt.lng, pt.lat]);

        // Ensure the polygon is closed (first point matches last point)
        if (coordinates.length > 0) {
            coordinates.push(coordinates[0]);
        }

        const payload = {
            geometry: {
                type: "Polygon",
                coordinates: [coordinates] // GeoJSON expects nested arrays for polygons
            },
            crop_type: "demo-crop"
        };

        const response = await fetch(`${API_URL}/analyze-risk`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to analyze risk:", error);
        throw error;
    }
};

/**
 * Saves field data to the backend.
 * @param {Object} fieldData - { name, geometry, risk_data }
 * @returns {Promise<Object>} - The saved field record
 */
export const saveField = async (fieldData) => {
    try {
        const response = await fetch(`${API_URL}/fields`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fieldData),
        });

        if (!response.ok) {
            throw new Error("Failed to save field");
        }
        return await response.json();
    } catch (error) {
        console.warn("Backend offline, saving to localStorage");
        const existing = JSON.parse(localStorage.getItem('agrisaas_fields') || '[]');
        const newField = { ...fieldData, id: `local-${Date.now()}`, created_at: new Date().toISOString() };
        existing.push(newField);
        localStorage.setItem('agrisaas_fields', JSON.stringify(existing));
        return { data: [newField] };
    }
};

/**
 * Fetches all saved fields from the backend.
 * @param {string} userId - The ID of the current authenticated user
 * @returns {Promise<Array>} - An array of field records
 */
export const getFields = async (userId) => {
    try {
        const response = await fetch(`${API_URL}/fields/${userId}`);
        if (!response.ok) throw new Error("Backend offline");
        const result = await response.json();
        return result.data || [];
    } catch (error) {
        console.warn("Backend offline, fetching from localStorage");
        return JSON.parse(localStorage.getItem('agrisaas_fields') || '[]');
    }
};

export const sendSMSAlert = async (toPhone, message) => {
    try {
        const response = await fetch(`${API_URL}/api/v1/notify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                to_phone: toPhone,
                message: message
            }),
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to send SMS:", error);
        throw error;
    }
};

export const saveFarm = async (farmData) => {
    try {
        // User requested redirecting saveFarm to /fields to unify persistence
        const response = await fetch(`${API_URL}/fields`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(farmData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Server Validation Error:", errorData);
            // DEBUG: Alert the user
            alert("ERROR DEL SERVIDOR:\n" + JSON.stringify(errorData, null, 2));
            throw new Error(errorData.detail || "Save Failed");
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to save farm:", error);
        throw error;
    }
};

/**
 * Fetches AI Agronomist recommendation.
 * @param {Object} contextData - { crop_type, growth_stage, ndvi_value, ... }
 * @returns {Promise<Object>} - The recommendation object
 */
export const getRecommendation = async (contextData) => {
    try {
        const response = await fetch(`${API_URL}/recommendation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(contextData),
        });

        if (!response.ok) {
            throw new Error(`Recommendation Failed: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to get recommendation:", error);
        return null;
    }
};

/**
 * IoT Sensor Telemetry Endpoints
 */
export const sendSensorTelemetry = async (payload) => {
    try {
        const response = await fetch(`${API_URL}/api/v1/sensors/telemetry`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error("Failed to send sensor telemetry");
        return await response.json();
    } catch (error) {
        console.error("sendSensorTelemetry error:", error);
        throw error;
    }
};

export const getLatestSensorData = async (deviceId) => {
    try {
        const response = await fetch(`${API_URL}/api/v1/sensors/latest/${deviceId}`);
        if (!response.ok) throw new Error("Failed to fetch sensor data");
        return await response.json();
    } catch (error) {
        console.error("getLatestSensorData error:", error);
        throw error;
    }
};

export const getSensorHistory = async (deviceId) => {
    try {
        const response = await fetch(`${API_URL}/api/v1/sensors/history/${deviceId}`);
        if (!response.ok) throw new Error("Failed to fetch sensor history");
        return await response.json();
    } catch (error) {
        console.error("getSensorHistory error:", error);
        throw error;
    }
};

export const getSensorDevices = async () => {
    try {
        const response = await fetch(`${API_URL}/api/v1/sensors/devices`);
        if (!response.ok) throw new Error("Failed to fetch sensor devices");
        return await response.json();
    } catch (error) {
        console.error("getSensorDevices error:", error);
        return { status: "SUCCESS", devices: [] };
    }
};

