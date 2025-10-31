import { useState, useEffect } from 'react';

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  data: GeolocationCoordinates | null;
}

export const useGeolocation = (enabled: boolean = false) => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!enabled) {
      // Reset state if disabled and not already in initial state
      if (state.loading || state.error || state.data) {
          setState({ loading: false, error: null, data: null });
      }
      return;
    }
    
    if (!navigator.geolocation) {
      setState({
        loading: false,
        error: new Error("Geolocation is not supported by your browser."),
        data: null,
      });
      return;
    }

    setState({ loading: true, error: null, data: null });

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        error: null,
        data: position.coords,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState({
        loading: false,
        error: error,
        data: null,
      });
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000 * 60 * 5 // 5 minutes cache
    });

  }, [enabled]);

  return state;
};