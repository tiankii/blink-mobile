import debounce from "lodash.debounce"
import React, { useRef } from "react"
import { View } from "react-native"
import MapView, { MapMarker as MapMarkerType, Region } from "react-native-maps"

import { useApolloClient } from "@apollo/client"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { BusinessMapMarkersQuery, MapMarker } from "@app/graphql/generated"
import { ListItem, makeStyles, useTheme } from "@rneui/themed"

import MapMarkerComponent from "../map-marker-component"
import ButtonMapsContainer from "./button-maps-container"
import MapStyles from "./map-styles.json"
import { OpenBottomModal, OpenBottomModalElement, TModal } from "./modals/modal-container"
import Icon from "react-native-vector-icons/Ionicons"

type Props = {
  data?: BusinessMapMarkersQuery
  userLocation?: Region
  handleMapPress: () => void
  handleMarkerPress: (_: MapMarker) => void
  focusedMarker: MapMarker | null
  focusedMarkerRef: React.MutableRefObject<MapMarkerType | null>
  handleCalloutPress: (_: MapMarker) => void
}

export default function MapComponent({
  data,
  userLocation,
  handleMapPress,
  handleMarkerPress,
  focusedMarker,
  focusedMarkerRef,
  handleCalloutPress,
}: Props) {
  const {
    theme: { colors, mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const client = useApolloClient()

  const mapViewRef = useRef<MapView>(null)
  const openBottomModalRef = React.useRef<OpenBottomModalElement>(null)

  // toggle modal from inside modal component instead of here in the parent
  const toggleModal = React.useCallback(
    (type: TModal) => openBottomModalRef.current?.toggleVisibility(type),
    [],
  )

  const debouncedHandleRegionChange = React.useRef(
    debounce((region: Region) => updateMapLastCoords(client, region), 1000, {
      trailing: true,
    }),
  ).current

  return (
    <View style={styles.viewContainer}>
      <MapView
        ref={mapViewRef}
        style={styles.map}
        showsMyLocationButton={false}
        initialRegion={userLocation}
        customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
        onPress={handleMapPress}
        onRegionChange={debouncedHandleRegionChange}
        onMarkerSelect={(e) => {
          // react-native-maps has a very annoying error on iOS
          // When two markers are almost on top of each other onSelect will get called for a nearby Marker
          // This improvement (not an optimal fix) checks to see if that error happened, and quickly reopens the correct callout
          const matchingLat =
            e.nativeEvent.coordinate.latitude ===
            focusedMarker?.mapInfo.coordinates.latitude
          const matchingLng =
            e.nativeEvent.coordinate.longitude ===
            focusedMarker?.mapInfo.coordinates.longitude
          if (!matchingLat || !matchingLng) {
            if (focusedMarkerRef.current) {
              focusedMarkerRef.current.showCallout()
            }
          }
        }}
      >
        {(data?.businessMapMarkers ?? []).map((item: MapMarker) => (
          <MapMarkerComponent
            key={item.username}
            item={item}
            color={colors._orange}
            handleCalloutPress={handleCalloutPress}
            handleMarkerPress={handleMarkerPress}
            isFocused={focusedMarker?.username === item.username}
          />
        ))}
      </MapView>
      <ButtonMapsContainer
        position="topCenter"
        event={() => toggleModal("locationEvent")}
      >
        <ListItem containerStyle={styles.list}>
          <Icon name="location-outline" color="white" size={15} />
          <ListItem.Title>Bitcoint Berlin, E</ListItem.Title>
          <Icon name="chevron-down-outline" color="white" />
        </ListItem>
      </ButtonMapsContainer>
      <ButtonMapsContainer
        event={() => toggleModal("filter")}
        position="LeftLv1"
        iconName="options-outline"
      />
      <ButtonMapsContainer
        event={() => toggleModal("search")}
        position="LeftLv2"
        iconName="search"
      />
      <OpenBottomModal ref={openBottomModalRef} />
    </View>
  )
}

const useStyles = makeStyles(() => ({
  map: {
    height: "100%",
    width: "100%",
  },
  list: {
    padding: 0,
    margin: 0,
    fontSize: "0.5rem",
    backgroundColor: "transparent",
  },
  viewContainer: { flex: 1 },
}))
