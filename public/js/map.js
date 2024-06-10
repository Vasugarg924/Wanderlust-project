mapboxgl.accessToken = mapToken;


const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: Listing.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(Listing.geometry.coordinates)  //Listing.geometry.cordinates
    .setPopup(new mapboxgl.Popup({ offset:25})
    .setHTML(`<h4>${Listing.title}</h4><p>Exact Location Provided after booking</p>`))
    .addTo(map);
