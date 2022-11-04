import { Location } from '@LocationOps/model';
import { Stack, Typography } from '@mui/material';
import { GoogleMap, InfoWindow, Marker } from '@react-google-maps/api';
import React, { useEffect, useId, useRef, useState } from 'react';
import color from 'src/theme/color';

const containerStyle = {
    height: '400px',
    borderRadius: '10px',
    border: '1px solid #ddd',
};

export default function ReactGMap(props: Props) {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [activeMaker, setActiveMaker] = useState({ lat: 0, lng: 0 });

    const locationsLatLng = props.locations.map((value, index) => {
        return {
            lat: value.Latitude!,
            lng: value.Longitude!,
        };
    });

    function callback(map: google.maps.Map) {
        const bounds = new google.maps.LatLngBounds();

        for (let i = 0; i < locationsLatLng.length; i++) {
            const position = new google.maps.LatLng(locationsLatLng[i].lat, locationsLatLng[i].lng);
            bounds.extend(position);
        }
        map.fitBounds(bounds);
        setMap(map);
    }

    const onLoad = React.useCallback(callback, [locationsLatLng]);

    const onUnmount = React.useCallback(function callback(map: google.maps.Map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map) {
            callback(map);
        }
    }, [locationsLatLng]);

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            options={{ panControl: false, streetViewControl: false, mapTypeControl: false }}
            onLoad={onLoad}
            onUnmount={onUnmount}
        >
            {props.locations.map((l, i) => {
                const lat = l.Latitude || 0;
                const lng = l.Longitude || 0;

                const latLng = new google.maps.LatLng({
                    lat: lat,
                    lng,
                });

                return (
                    <React.Fragment key={i}>
                        <Marker
                            onClick={(e) => {
                                console.log(lat, lng);
                                setActiveMaker({ lat, lng });
                            }}
                            position={latLng}
                            icon={{
                                scaledSize: new google.maps.Size(30, 30),
                                scale: 9,
                                path: google.maps.SymbolPath.CIRCLE,
                                strokeColor: color.danger,
                                strokeWeight: 18,
                                size: new google.maps.Size(30, 30),
                            }}
                            label={{
                                text: `${i + 1}`,
                                color: 'white',
                                fontWeight: '500',
                                fontFamily: 'inherit',
                                className: 'maker-label',
                            }}
                        />

                        {lat === activeMaker.lat && lng === activeMaker.lng && (
                            <InfoWindow
                                position={latLng}
                                zIndex={1}
                                onCloseClick={() => setActiveMaker({ lat: 0, lng: 0 })}
                            >
                                <Stack style={{ maxWidth: 250 }}>
                                    <Typography style={{ fontWeight: 500 }}>{l.Name}</Typography>

                                    <Typography style={{ marginTop: '8px', marginBottom: '8px' }}>
                                        Address: {l.Address}
                                    </Typography>

                                    <Typography>Zones: 10</Typography>
                                </Stack>
                            </InfoWindow>
                        )}
                    </React.Fragment>
                );
            })}
        </GoogleMap>
    );
}

type Props = {
    locations: Location[];
};
