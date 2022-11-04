import { appConfig } from '@config';
import { LocationCoverage } from '@LocationOps/model';
import { Avatar, Stack, Typography } from '@mui/material';
import { GoogleMap, InfoBox, InfoWindow, Marker, Polyline } from '@react-google-maps/api';
import { WardenWithRelations } from '@WardenOps/model';
import moment from 'moment';
import { Fragment, useEffect, useId, useRef, useState } from 'react';
import axiosInstant from 'src/helpers/axiosHelper';
import color from 'src/theme/color';
import { DistanceResponse, LatLng } from './GMapInterface';

moment.locale('en', {
    week: {
        dow: 0,
    },
});

const containerStyle = {
    height: '400px',
    borderRadius: '10px',
    border: '1px solid #ddd',
};

const center = {
    lat: -3.745,
    lng: -38.523,
};

const options = {
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    clickable: false,
    draggable: false,
    editable: false,
    visible: true,
    radius: 30000,
    zIndex: 1,
};

export default function ReactGMap(props: Props) {
    const refMap = useRef<google.maps.Map>();
    const [activeMaker, setActiveMaker] = useState({ lat: 0, lng: 0 });

    const locationsLatLng = props.locations.map((value, index) => {
        return {
            lat: value.Location.Latitude!,
            lng: value.Location.Longitude!,
        };
    });

    const wardensLatLng = props.wardens.map((w) => ({ lat: w.Latitude!, lng: w.Longitude! }));
    const wardenLatLng = { lat: props.selectWarden?.Latitude || 0, lng: props.selectWarden?.Longitude || 0 };

    const selectLocationLatLng = props.selectWarden?.Rotas?.sort(
        (a, b) => moment(a.TimeFrom).unix() - moment(b.TimeFrom).unix()
    ).map((r) => {
        const location = props.locations.find((l) => l.Location.Id === r.LocationId);
        return {
            lat: location?.Location.Latitude || 0,
            lng: location?.Location.Longitude || 0,
        };
    });

    const polylineLatLng = [wardenLatLng, ...(selectLocationLatLng || [])];

    const allLatLng = locationsLatLng.concat(wardensLatLng);

    const onLoad = (map: google.maps.Map) => {
        refMap.current = map;
    };

    useEffect(() => {
        var bounds = new google.maps.LatLngBounds();

        for (let i = 0; i < allLatLng.length; i++) {
            const position = new google.maps.LatLng(allLatLng[i].lat, allLatLng[i].lng);
            bounds.extend(position);
        }
        refMap.current?.fitBounds(bounds);
    }, [allLatLng]);

    var rad = function (x: number) {
        return (x * Math.PI) / 180;
    };

    // var getDistance = function (p1: any, p2: any) {
    //     var R = 6378137; // Earth’s mean radius in meter
    //     var dLat = rad(p2.lat() - p1.lat());
    //     var dLong = rad(p2.lng() - p1.lng());
    //     var a =
    //         Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //         Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
    //     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    //     var d = R * c;
    //     return d; // returns the distance in meter
    // };

    // const d = getDistance(new google.maps.LatLng(43.0, -75.0), new google.maps.LatLng(41.43206, -81.38992));

    // console.log(`distance`, d);

    return (
        <GoogleMap
            mapContainerStyle={containerStyle}
            options={{ panControl: false, streetViewControl: false, mapTypeControl: false }}
            onLoad={onLoad}
        >
            {props.locations
                .filter((f) => f.RequireWarden)
                .map((l, i) => {
                    const lat = l.Location.Latitude || 0;
                    const lng = l.Location.Longitude || 0;
                    const latLng = new google.maps.LatLng({
                        lat: lat,
                        lng,
                    });

                    return (
                        <Fragment key={i}>
                            <Marker
                                onClick={(e) => {
                                    console.log({ lat, lng });
                                    setActiveMaker({ lat, lng });
                                }}
                                position={latLng}
                                icon={{
                                    scaledSize: new google.maps.Size(30, 30),
                                    scale: 9,
                                    path: google.maps.SymbolPath.CIRCLE,
                                    strokeColor: l.MissingWarden === 0 ? color.primary : '#FFDC83',
                                    strokeWeight: 18,
                                    size: new google.maps.Size(30, 30),
                                }}
                                label={{
                                    text: `${l.MissingWarden}(${l.RequireWarden})`,
                                    color: l.MissingWarden === 0 ? 'white' : 'red',
                                    fontWeight: '500',
                                    fontFamily: 'inherit',
                                    className: 'maker-label',
                                }}
                            />

                            {latLng.lat() === activeMaker.lat && latLng.lng() === activeMaker.lng && (
                                <InfoWindow
                                    position={latLng}
                                    zIndex={1}
                                    onCloseClick={() => setActiveMaker({ lat: 0, lng: 0 })}
                                >
                                    <Stack style={{ maxWidth: 250 }}>
                                        <Typography style={{ fontWeight: 500 }}>{l.Location.Name}</Typography>

                                        <Typography style={{ marginTop: '8px', marginBottom: '8px' }}>
                                            Address: {l.Location.Address}
                                        </Typography>

                                        <Typography>Zones: 10</Typography>
                                    </Stack>
                                </InfoWindow>
                            )}
                        </Fragment>
                    );
                })}

            {props.wardens.map((w, i) => {
                const latLng = new google.maps.LatLng({
                    lat: w.Latitude || 0,
                    lng: w.Longitude || 0,
                });

                return (
                    <InfoBox
                        key={`${w.Latitude}${w.Longitude}${i}`}
                        position={latLng}
                        options={{
                            closeBoxURL: ``,
                            enableEventPropagation: true,
                            // boxStyle: { transform: 'translateZ(0px) translate(-50%, -50%) !important' },
                            boxClass: 'info-box-class',
                        }}
                    >
                        <Avatar
                            sx={{ border: '3px solid', borderColor: w.Rotas?.length ? '#E01B00' : '#85858A' }}
                            src={w.Picture}
                            onClick={() => {
                                console.log({ lat: w.Latitude, lng: w.Longitude });
                                props.onSelectWarden(w);
                            }}
                        >
                            {w.FullName}
                        </Avatar>
                    </InfoBox>
                );
            })}

            <Polyline path={polylineLatLng} options={options} />
        </GoogleMap>
    );
}

type Props = {
    locations: LocationCoverage[];
    wardens: WardenWithRelations[];
    selectWarden?: WardenWithRelations;
    onSelectWarden(selectWarden?: WardenWithRelations): void;
};
