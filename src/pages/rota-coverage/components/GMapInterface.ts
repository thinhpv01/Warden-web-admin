export type LatLng = {
    lat: number;
    lng: number;
};

export interface Distance {
    text: string;
    value: number;
}

export interface Duration {
    text: string;
    value: number;
}

export interface Element {
    distance: Distance;
    duration: Duration;
    status: string;
}

export interface Row {
    elements: Element[];
}

export interface DistanceResponse {
    destination_addresses: string[];
    origin_addresses: string[];
    rows: Row[];
    status: string;
}

export const getDistance = async (origins: LatLng, destinations: LatLng) => {
    const service = new google.maps.DistanceMatrixService();

    const res = await service.getDistanceMatrix({
        origins: [new google.maps.LatLng({ lat: origins.lat, lng: origins.lng })],
        destinations: [new google.maps.LatLng({ lat: destinations.lat, lng: destinations.lng })],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        avoidHighways: false,
        avoidTolls: false,
    });
    console.log(`res`, res);

    return Math.floor(res.rows[0].elements[0]?.distance?.value / 1000);
};

export const getLatLng = (obj: any) => {
    return {
        lat: obj.Latitude || 0,
        lng: obj.Longitude || 0,
    };
};
