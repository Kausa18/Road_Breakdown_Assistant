import axios from 'axios';

const ORS_API_KEY = '5b3ce3597851110001cf62487e71534dacc7453ab84e4a21949e5eb2'; // Your actual OpenRouteService API key

export const getRouteETA = async (from, to) => {
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car';

  try {
    const response = await axios.post(
      url,
      {
        coordinates: [
          [from.lng, from.lat],
          [to.lng, to.lat]
        ]
      },
      {
        headers: {
          Authorization: ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = response.data;

    return {
      distance: data.routes[0].summary.distance, // meters
      duration: data.routes[0].summary.duration, // seconds
      geometry: data.routes[0].geometry // for drawing route
    };
  } catch (error) {
    console.error('❌ ORS API error:', error.message);
    return null;
  }
};
