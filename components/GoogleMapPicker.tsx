"use client";

import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { LocateFixed, Loader2, MapPin, Maximize2, Minimize2 } from "lucide-react";

export interface MapLocation {
  lat: number;
  lng: number;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
}

interface Props {
  initial?: { lat?: number; lng?: number };
  onSelect: (loc: MapLocation) => void;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

function parseComponents(
  components: google.maps.GeocoderAddressComponent[]
): Omit<MapLocation, "lat" | "lng"> {
  const get = (types: string[]) =>
    components.find((c) => types.some((t) => c.types.includes(t)))?.long_name ?? "";

  const streetNum = get(["street_number"]);
  const route = get(["route"]);
  const sublocality = get(["sublocality_level_1", "sublocality", "neighborhood"]);
  const line1 = [streetNum, route].filter(Boolean).join(" ") || sublocality;
  const line2 = line1 ? sublocality : "";
  const city =
    get(["locality"]) ||
    get(["administrative_area_level_2"]) ||
    get(["administrative_area_level_3"]);
  const state = get(["administrative_area_level_1"]);
  const pincode = get(["postal_code"]);
  return { line1, line2, city, state, pincode };
}

export function GoogleMapPicker({ initial, onSelect }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 };
  const DEFAULT_ZOOM = 5;

  useEffect(() => {
    if (!API_KEY) { setError("no_key"); return; }
    setOptions({ key: API_KEY } as any);
    importLibrary("maps")
      .then(() => setLoaded(true))
      .catch(() => setError("load_failed"));
  }, []);

  useEffect(() => {
    if (!loaded || !mapRef.current) return;

    const center =
      initial?.lat && initial?.lng
        ? { lat: initial.lat, lng: initial.lng }
        : DEFAULT_CENTER;
    const zoom = initial?.lat ? 16 : DEFAULT_ZOOM;

    const map = new google.maps.Map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: [
        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
      ],
    });
    mapInstance.current = map;
    geocoder.current = new google.maps.Geocoder();

    const marker = new google.maps.Marker({
      map,
      position: initial?.lat ? center : undefined,
      draggable: true,
      animation: google.maps.Animation.DROP,
    });
    markerInstance.current = marker;

    marker.addListener("dragend", () => {
      const pos = marker.getPosition();
      if (!pos) return;
      geocoder.current?.geocode({ location: pos }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const parsed = parseComponents(results[0].address_components ?? []);
          onSelect({ lat: pos.lat(), lng: pos.lng(), ...parsed });
        }
      });
    });

    map.addListener("click", (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      marker.setPosition(e.latLng);
      geocoder.current?.geocode({ location: e.latLng }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const parsed = parseComponents(results[0].address_components ?? []);
          onSelect({ lat: e.latLng!.lat(), lng: e.latLng!.lng(), ...parsed });
        }
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  // Trigger map resize whenever fullscreen mode changes
  useEffect(() => {
    if (!mapInstance.current) return;
    const t = setTimeout(() => {
      google.maps.event.trigger(mapInstance.current!, "resize");
      const pos = markerInstance.current?.getPosition();
      if (pos) mapInstance.current!.panTo(pos);
    }, 80);
    return () => clearTimeout(t);
  }, [isFullscreen]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const latLng = new google.maps.LatLng(lat, lng);
        mapInstance.current?.panTo(latLng);
        mapInstance.current?.setZoom(17);
        markerInstance.current?.setPosition(latLng);
        markerInstance.current?.setAnimation(google.maps.Animation.DROP);
        geocoder.current?.geocode({ location: latLng }, (results, status) => {
          setLocating(false);
          if (status === "OK" && results?.[0]) {
            const parsed = parseComponents(results[0].address_components ?? []);
            onSelect({ lat, lng, ...parsed });
          }
        });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  if (error === "no_key") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-sand bg-sand/40 p-4 text-sm text-espresso/60">
        <MapPin size={16} className="shrink-0 text-terracotta/60" />
        <span>
          Add <code className="rounded bg-sand px-1 text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>{" "}
          to enable the map picker.
        </span>
      </div>
    );
  }

  if (error === "load_failed") {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Failed to load Google Maps. Check your API key and internet connection.
      </div>
    );
  }

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[200] flex flex-col bg-cream p-4"
          : "space-y-2"
      }
    >
      {/* Fullscreen header */}
      {isFullscreen && (
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display font-semibold text-espresso">
            Pin your delivery location
          </p>
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="flex items-center gap-1.5 rounded-xl bg-terracotta px-4 py-2 text-sm font-semibold text-white shadow-warm transition hover:bg-terracotta-dark"
          >
            <Minimize2 size={14} />
            Done
          </button>
        </div>
      )}

      {/* Map */}
      <div
        className={`relative overflow-hidden rounded-2xl border border-sand ${
          isFullscreen ? "flex-1" : ""
        }`}
      >
        {!loaded && (
          <div
            className={`flex items-center justify-center bg-sand/30 ${
              isFullscreen ? "h-full" : "h-56"
            }`}
          >
            <Loader2 size={24} className="animate-spin text-terracotta/60" />
          </div>
        )}
        <div
          ref={mapRef}
          className={`w-full transition-opacity ${
            loaded ? "opacity-100" : "opacity-0 absolute"
          } ${isFullscreen ? "h-full" : "h-56"}`}
        />

        {/* Fullscreen toggle button */}
        {loaded && (
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            title={isFullscreen ? "Exit fullscreen" : "Expand map"}
            className="absolute right-2 top-2 z-10 rounded-lg bg-white/90 p-1.5 shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            {isFullscreen ? (
              <Minimize2 size={16} className="text-espresso/70" />
            ) : (
              <Maximize2 size={16} className="text-espresso/70" />
            )}
          </button>
        )}
      </div>

      {/* Use my location */}
      <button
        type="button"
        onClick={useMyLocation}
        disabled={!loaded || locating}
        className={`flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-terracotta/40 bg-terracotta/5 py-2.5 text-sm font-medium text-terracotta transition hover:bg-terracotta/10 disabled:opacity-60 ${
          isFullscreen ? "mt-3" : ""
        }`}
      >
        {locating ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <LocateFixed size={15} />
        )}
        {locating ? "Locating…" : "Use my current location"}
      </button>

      {loaded && (
        <p className="text-center text-xs text-espresso/40">
          Click on the map or drag the pin to choose your exact location.
        </p>
      )}
    </div>
  );
}
