import React, { useState, useEffect } from 'react';
import { CloudMoon, Sun, CloudRain, Cloud, CloudSnow, CloudLightning, Loader2 } from 'lucide-react';

export function WeatherWidget({ defaultCity }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [city, setCity] = useState(defaultCity || 'Loading...');

    useEffect(() => {
        const fetchWeather = async (lat, lon, cityName) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                if (!res.ok) throw new Error('Weather API error');
                const data = await res.json();
                setWeather(data.current_weather);
                setCity(cityName);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch weather:", err);
                setError(true);
                setLoading(false);
            }
        };

        const fetchByCity = async () => {
            try {
                const targetCity = defaultCity || 'Delhi';
                
                // 1. Geocode the society's city name to get accurate Lat/Lon
                const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(targetCity)}&count=1`);
                if (!geoRes.ok) throw new Error('City Geocoding failed');
                const geoData = await geoRes.json();
                
                if (geoData.results && geoData.results.length > 0) {
                    const { latitude, longitude, name } = geoData.results[0];
                    // 2. Fetch Weather for the exact city coordinates
                    fetchWeather(latitude, longitude, name);
                } else {
                    throw new Error('City not found in geocoding API');
                }
            } catch (err) {
                console.warn("City Geocoding failed. Falling back to default Delhi coordinates.", err);
                fetchWeather(28.6139, 77.2090, defaultCity || 'Delhi');
            }
        };

        fetchByCity();
    }, [defaultCity]);

    if (loading) {
        return (
            <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-4 py-2 border border-slate-700/50 backdrop-blur-md">
                <Loader2 className="w-7 h-7 text-white font-bold animate-spin" />
                <div>
                    <div className="h-4 w-12 bg-slate-700/50 rounded mb-1 animate-pulse"></div>
                    <div className="h-3 w-16 bg-slate-700/50 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return null;
    }

    // Map WMO codes to Icons and Text
    const getWeatherDetails = (code) => {
        if (code === 0) return { icon: Sun, text: 'Clear Sky', color: 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]' };
        if (code >= 1 && code <= 3) return { icon: Cloud, text: 'Partly Cloudy', color: 'text-white font-bold drop-shadow-[0_0_10px_rgba(203,213,225,0.5)]' };
        if (code >= 51 && code <= 67) return { icon: CloudRain, text: 'Rain', color: 'text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]' };
        if (code >= 71 && code <= 77) return { icon: CloudSnow, text: 'Snow', color: 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' };
        if (code >= 95 && code <= 99) return { icon: CloudLightning, text: 'Thunderstorm', color: 'text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.5)]' };
        return { icon: CloudMoon, text: 'Unknown', color: 'text-white font-bold' };
    };

    const details = getWeatherDetails(weather.weathercode);
    const Icon = details.icon;

    return (
        <div className="flex items-center gap-3 bg-slate-900/40 rounded-xl px-4 py-2 border border-slate-700/50 backdrop-blur-md">
            <Icon className={details.color} size={28} strokeWidth={1.5} />
            <div>
                <div className="text-lg font-bold text-white leading-none mb-1">{Math.round(weather.temperature)}°C</div>
                <div className="text-[10px] font-bold text-white font-bold leading-none">{details.text}, {city}</div>
            </div>
        </div>
    );
}
