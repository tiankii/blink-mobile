import debounce from "lodash.debounce"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { Dimensions, View } from "react-native"
import MapView, { Region } from "react-native-maps"

import { useApolloClient } from "@apollo/client"
import { updateMapLastCoords } from "@app/graphql/client-only-query"
import { MapMarker } from "@app/graphql/generated"
import { ListItem, makeStyles, useTheme } from "@rneui/themed"

import ButtonMapsContainer from "./button-maps-container"
import MapStyles from "./map-styles.json"
import { OpenBottomModal, OpenBottomModalElement, TModal } from "./modals/modal-container"
import Icon from "react-native-vector-icons/Ionicons"
import { IMarker } from "@app/screens/map-screen/btc-map-interface"
import { useClusterer, isPointCluster } from "react-native-clusterer"
import { ClusterPoint } from "./map-types"
import ClusterComponent from "@app/components/map-component/map-elements/cluster-component.tsx"
import MarkerComponent from "@app/components/map-component/map-elements/marker-component.tsx"
import { Category } from "@app/components/map-component/categories.ts"

type Props = {
  data?: IMarker[]
  userLocation: Region
  handleCalloutPress: (_: MapMarker) => void
}

const { width, height } = Dimensions.get("window")

// config, we will need to finetune this
const CLUSTER_OPTIONS = {
  radius: 50,
  maxZoom: 16,
  minPoints: 2,
  extent: 512,
}
export default function MapComponent({ data, userLocation }: Props) {
  const {
    theme: { mode: themeMode },
  } = useTheme()
  const styles = useStyles()
  const client = useApolloClient()

  const mapViewRef = useRef<MapView>(null)
  const openBottomModalRef = React.useRef<OpenBottomModalElement>(null)

  const [focusedMarker, setFocusedMarker] = React.useState<IMarker | null>(null)
  const [region, setRegion] = useState(userLocation)

  const [categoryFilters, setCategoryFilters] = useState<Set<Category>>(new Set())

  // Toggle modal from inside modal component instead of here in the parent
  const toggleModal = React.useCallback(
    (type: TModal) => openBottomModalRef.current?.toggleVisibility(type),
    [],
  )

  const handleClusterClick = useCallback(() => {}, [])
  const handleMarkerSelect = useCallback(() => {}, [])

  const categoryFilteredData = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }
    if (categoryFilters.size === 0) {
      return data
    }
    return data.filter(
      (marker) => marker.category && categoryFilters.has(marker.category),
    )
  }, [data, categoryFilters])

  const geoPoints = useMemo<ClusterPoint[]>(() => {
    if (!categoryFilteredData) {
      return []
    }
    return categoryFilteredData.map((marker) => ({
      type: "Feature",
      properties: {
        markerData: marker,
      },
      geometry: {
        type: "Point",
        coordinates: [marker.location.longitude, marker.location.latitude],
      },
    }))
  }, [categoryFilteredData])

  const [points] = useClusterer(geoPoints, { width, height }, region, CLUSTER_OPTIONS)

  // Render markers
  const renderedMarkers = useMemo(() => {
    return points.map((point, index) => {
      const key = `point-${index}`

      if (isPointCluster(point)) {
        return <ClusterComponent cluster={point} onPress={handleClusterClick} key={key} />
      }
      return (
        <MarkerComponent
          pin={point.properties.markerData as IMarker}
          onSelect={handleMarkerSelect}
          key={key}
        />
      )
    })
  }, [points, handleClusterClick, handleMarkerSelect])

  const debouncedHandleRegionChange = useCallback(
    (newRegion: Region) => {
      // update region state first, so clusterer can do the job, but wait for updating coords in API
      setRegion(newRegion)
      debounce(() => {
        updateMapLastCoords(client, newRegion)
      }, 1000)
    },

    [client],
  )

  return (
    <View style={styles.viewContainer}>
      <MapView
        ref={mapViewRef}
        // onPress={handleMapPress}
        onRegionChangeComplete={debouncedHandleRegionChange}
        style={styles.map}
        customMapStyle={themeMode === "dark" ? MapStyles.dark : MapStyles.light}
        initialRegion={userLocation}
        moveOnMarkerPress={false}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        scrollEnabled={true}
        zoomEnabled={true}
        rotateEnabled={false}
        pitchEnabled={false}
        mapType="standard"
        loadingEnabled={true}
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
      >
        {renderedMarkers}
      </MapView>

      <ButtonMapsContainer
        key={focusedMarker?.id}
        position="topCenter"
        event={() => {
          // moveToFocusedMarker()
          toggleModal("locationEvent")
        }}
      >
        <ListItem containerStyle={styles.list}>
          <Icon name="location-outline" color="white" size={15} />
          <ListItem.Title ellipsizeMode="tail" numberOfLines={1} style={styles.listTitle}>
            {`${
              focusedMarker?.location?.tags["addr:street"] ||
              focusedMarker?.location?.tags["addr:city"] ||
              focusedMarker?.location?.tags.name ||
              ""
            }`}
          </ListItem.Title>
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
      <OpenBottomModal
        ref={openBottomModalRef}
        focusedMarker={focusedMarker}
        filters={categoryFilters}
        setFilters={setCategoryFilters}
      />
    </View>
  )
}

export const useStyles = makeStyles(() => ({
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
  listTitle: {
    maxWidth: 200,
  },

  viewContainer: { flex: 1 },

  clusterContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4f378c",
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 6,
    // borderColor: "#4f378cb3"
  },
  clusterBubble: {
    backgroundColor: "white",
    padding: 5,
    borderRadius: 15,
  },
  clusterText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  iconOverlay: {
    position: "absolute",
    top: 10, // ajusta según el pin
    alignSelf: "center",
  },
}))
// const moveToFocusedMarker = () => {
//   const map = mapViewRef.current?.getMapRef()
//   // console.log("Métodos disponibles:", mapViewRef.current?.getMapRef().animateToRegion);
//
//   if (focusedMarker) {
//     map?.animateToRegion(
//       {
//         latitude: focusedMarker.location.latitude,
//         longitude: focusedMarker.location.longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       },
//       1000,
//     )
//   }
// }
