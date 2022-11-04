import { Location } from '@LocationOps/model';
import { Avatar, Stack, Typography } from '@mui/material';
import { GoogleMap, InfoBox, InfoWindow, Marker, Polyline } from '@react-google-maps/api';
import { Warden } from '@WardenOps/model';
import React, { useEffect, useId, useRef, useState } from 'react';
import color from 'src/theme/color';

const containerStyle = {
    height: '400px',
    borderRadius: '10px',
    border: '1px solid #ddd',
};

const options = {
    strokeColor: '#007BFF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#007BFF',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1,
};
export default function Map(props: Props) {
    const refMap = useRef<google.maps.Map>();
    const [activeMaker, setActiveMaker] = useState({ lat: 0, lng: 0 });

    const locationsLatLng = props.locations.map((value, index) => {
        return {
            lat: value.Latitude!,
            lng: value.Longitude!,
        };
    });
    const wardenLatLng = { lat: props.warden?.Latitude || 0, lng: props.warden?.Longitude || 0 };
    const polylineLatLng = [wardenLatLng, ...(locationsLatLng || [])];

    const positionWarden = new google.maps.LatLng({
        lat: props.warden.Latitude || 0,
        lng: props.warden.Longitude || 0,
    });
    const onLoad = (map: google.maps.Map) => {
        refMap.current = map;
    };
    const allLatLng = locationsLatLng.concat(wardenLatLng);

    useEffect(() => {
        var bounds = new google.maps.LatLngBounds();

        for (let i = 0; i < allLatLng.length; i++) {
            const position = new google.maps.LatLng(allLatLng[i].lat, allLatLng[i].lng);
            bounds.extend(position);
        }
        refMap.current?.fitBounds(bounds);
    }, [allLatLng]);

    const id = useId();

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            options={{ panControl: false, streetViewControl: false, mapTypeControl: false }}
            onLoad={onLoad}
            id={id}
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
                                setActiveMaker({ lat, lng });
                            }}
                            position={latLng}
                            icon={{
                                scaledSize: new google.maps.Size(30, 30),
                                scale: 9,
                                path: google.maps.SymbolPath.CIRCLE,
                                strokeColor: l.LocationType === 'static' ? color.primary : '#F09453',
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
                                </Stack>
                            </InfoWindow>
                        )}
                    </React.Fragment>
                );
            })}
            <InfoBox
                position={positionWarden}
                options={{
                    closeBoxURL: ``,
                    enableEventPropagation: true,
                    boxClass: 'info-box-class',
                }}
            >
                <Avatar sx={{ border: '3px solid', borderColor: '#007BFF' }} src={props.warden.Picture}>
                    {props.warden.FullName}
                </Avatar>
            </InfoBox>
            <Polyline path={polylineLatLng} options={options} />
        </GoogleMap>
    );
}

type Props = {
    locations: Location[];
    warden: Warden;
};
