'use client'

import ComponentContainerCard from '@/components/ComponentContainerCard'
import PageTitle from '@/components/PageTitle'
import { GoogleMap, InfoWindow, LoadScript, Marker, Polyline } from '@react-google-maps/api'
import { useMemo, useState } from 'react'
import { Col, Row } from 'react-bootstrap'

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  position: 'relative' as const,
}

const defaultCenter = { lat: 21.569874, lng: 71.5893798 }
const streetViewCenter = { lat: 40.7295174, lng: -73.9986496 }
const altCenter = { lat: -12.043333, lng: -77.028333 }

type MarkerState = {
  name: string
  position: { lat: number; lng: number }
} | null

const mapLibraries: ('places' | 'geometry' | 'drawing' | 'visualization')[] = ['places']

const BasicMap = () => (
  <ComponentContainerCard title="Basic Google Map">
    <div className="gmaps position-relative">
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={defaultCenter} options={{ zoomControl: true }} />
    </div>
  </ComponentContainerCard>
)

const MapWithMarkers = () => {
  const [selectedMarker, setSelectedMarker] = useState<MarkerState>(null)

  return (
    <ComponentContainerCard title="Markers Google Map">
      <div id="gmaps-markers" className="gmaps position-relative">
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={18} center={defaultCenter} options={{ zoomControl: true }}>
          <Marker position={defaultCenter} title="This is sweet home." onClick={() => alert('You clicked this marker')} />
          <Marker
            position={{ lat: 21.56969, lng: 71.5893798 }}
            title="Marker with InfoWindow"
            onClick={() => setSelectedMarker({ name: 'Current location', position: { lat: 21.56969, lng: 71.5893798 } })}
          />
          {selectedMarker && (
            <InfoWindow position={selectedMarker.position} onCloseClick={() => setSelectedMarker(null)}>
              <div>
                <p className="mb-0">{selectedMarker.name}</p>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>
    </ComponentContainerCard>
  )
}

const StreetViewMap = () => (
  <ComponentContainerCard title="Street View Panoramas Google Map">
      <div id="panorama" className="gmaps position-relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={streetViewCenter}
          options={{ streetViewControl: true }}
        />
      </div>
    </ComponentContainerCard>
  )

const PolyLineMap = () => {
  const polyline = [
    { lat: 37.789411, lng: -122.422116 },
    { lat: 37.785757, lng: -122.421333 },
    { lat: 37.789352, lng: -122.415346 },
  ]

  return (
    <ComponentContainerCard title="Google Map Types">
      <div id="polyline-map" className="gmaps position-relative">
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={14} center={polyline[0]} options={{ zoomControl: true }}>
          <Polyline path={polyline} options={{ strokeColor: '#0000FF', strokeOpacity: 0.8, strokeWeight: 2 }} />
        </GoogleMap>
      </div>
    </ComponentContainerCard>
  )
}

const LightStyledMap = () => {
  const mapStyles = useMemo(
    () => [
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#e9e9e9' }, { lightness: 17 }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }, { lightness: 20 }] },
      { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#ffffff' }, { lightness: 17 }] },
      { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 18 }] },
      { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }, { lightness: 16 }] },
      { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    ],
    [],
  )

  return (
    <ComponentContainerCard title="Ultra Light with Labels">
      <div id="light-map" className="gmaps position-relative">
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={altCenter} options={{ styles: mapStyles }} />
      </div>
    </ComponentContainerCard>
  )
}

const DarkStyledMap = () => {
  const mapStyles = useMemo(
    () => [
      { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#ffffff' }] },
      { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }] },
      { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#000000' }] },
      { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: '#e5c163' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }] },
    ],
    [],
  )

  return (
    <ComponentContainerCard title="Dark">
      <div id="dark-map" className="gmaps position-relative">
        <GoogleMap mapContainerStyle={mapContainerStyle} zoom={12} center={altCenter} options={{ styles: mapStyles }} />
      </div>
    </ComponentContainerCard>
  )
}

const MapsContent = () => (
  <>
    <PageTitle title="Google Maps" />
    <Row>
      <Col xl={6}>
        <BasicMap />
      </Col>
      <Col xl={6}>
        <MapWithMarkers />
      </Col>
    </Row>
    <Row>
      <Col xl={6}>
        <StreetViewMap />
      </Col>
      <Col xl={6}>
        <PolyLineMap />
      </Col>
    </Row>
    <Row>
      <Col xl={6}>
        <LightStyledMap />
      </Col>
      <Col xl={6}>
        <DarkStyledMap />
      </Col>
    </Row>
  </>
)

const AllGoogleMaps = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  if (!apiKey) {
    return (
      <>
        <PageTitle title="Google Maps" />
        <ComponentContainerCard title="Google Maps Unavailable">
          <div className="p-4 text-sm text-muted">
            Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable these examples.
          </div>
        </ComponentContainerCard>
      </>
    )
  }

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={mapLibraries}>
      <MapsContent />
    </LoadScript>
  )
}

export default AllGoogleMaps
