import { CountryCode } from "libphonenumber-js/mobile"
import * as React from "react"
// eslint-disable-next-line react-native/split-platform-components
import { Alert, Dimensions, View, ActivityIndicator } from "react-native"
import { Region } from "react-native-maps"

import MapComponent from "@app/components/map-component"
import { MapMarker, useRegionQuery } from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import useDeviceLocation from "@app/hooks/use-device-location"
import { useI18nContext } from "@app/i18n/i18n-react"
import Geolocation from "@react-native-community/geolocation"
import { StackNavigationProp } from "@react-navigation/stack"

import countryCodes from "../../../utils/countryInfo.json"
import { Screen } from "../../components/screen"
import { RootStackParamList } from "../../navigation/stack-param-lists"
import { toastShow } from "../../utils/toast"
import { IMarker } from "./btc-map-interface"
import { useCallback, useMemo } from "react"
import { Place } from "@app/components/map-component/map-types"
import { usePlacesData } from "@app/components/map-component/map-hooks/use-places-data.ts"
import MaterialIcons from "react-native-vector-icons/MaterialIcons"
import { makeStyles } from "@rneui/themed"

const EL_ZONTE_COORDS = {
  latitude: 13.496743,
  longitude: -89.439462,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
}

// essentially calculates zoom for location being set based on country
const { height, width } = Dimensions.get("window")
const LATITUDE_DELTA = 15 // <-- decrease for more zoom
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height)
type Props = {
  navigation: StackNavigationProp<RootStackParamList, "Primary">
}

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  enableBackgroundLocationUpdates: false,
  authorizationLevel: "whenInUse",
  locationProvider: "auto",
})

const transformPlacesToMarkers = (places: Place[]): IMarker[] => {
  return places
    .filter((p) => p && typeof p.lat === "number" && typeof p.lon === "number")
    .map(({ lon, lat, id, icon, name, category }) => ({
      id,
      icon,
      name: name ?? null,
      category: category ?? null,
      location: {
        latitude: lat,
        longitude: lon,
      },
      tags: {},
    }))
}

export const MapScreen: React.FC<Props> = ({ navigation }) => {
  const isAuthed = useIsAuthed()
  const { countryCode, loading } = useDeviceLocation()
  const { data: lastRegion, error: lastRegionError } = useRegionQuery()
  const { LL } = useI18nContext()

  const styles = useStyles()

  const { places, error, isLoading } = usePlacesData()

  const [initialLocation, setInitialLocation] = React.useState<Region>()
  const [isInitializing, setInitializing] = React.useState(true)

  const showError = useCallback(
    (errorMessage: string) => {
      toastShow({ message: errorMessage, LL })
    },
    [LL],
  )

  React.useEffect(() => {
    if (error) {
      showError(error)
    }
  }, [error, showError])

  React.useEffect(() => {
    let isMounted = true
    const loadResources = async () => {
      try {
        await MaterialIcons.loadFont()
        if (isMounted) {
          setInitializing(false)
        }
      } catch (err) {
        console.warn("Failed to load font:", err)
        if (isMounted) {
          setInitializing(false)
        }
      }
    }
    loadResources()
    return () => {
      isMounted = false
    }
  }, [])

  const alertOnLocationError = React.useCallback(() => {
    Alert.alert(LL.common.error(), LL.MapScreen.error())
  }, [LL])

  React.useEffect(() => {
    if (lastRegionError) {
      setInitializing(false)
      setInitialLocation(EL_ZONTE_COORDS)
      alertOnLocationError()
    }
  }, [lastRegionError, alertOnLocationError])

  // Flow when location permissions are denied
  React.useEffect(() => {
    if (countryCode && lastRegion && !isInitializing && !loading && !initialLocation) {
      // User has used map before, so we use their last viewed coords
      if (lastRegion.region) {
        const { latitude, longitude, latitudeDelta, longitudeDelta } = lastRegion.region
        const region: Region = {
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        }
        setInitialLocation(region)
        // User is using maps for the first time, so we center on the center of their IP's country
      } else {
        // JSON 'hashmap' with every countrys' code listed with their lat and lng
        const countryCodesToCoords: {
          data: Record<CountryCode, { lat: number; lng: number }>
        } = JSON.parse(JSON.stringify(countryCodes))
        const countryCoords: { lat: number; lng: number } =
          countryCodesToCoords.data[countryCode]
        if (countryCoords) {
          const region: Region = {
            latitude: countryCoords.lat,
            longitude: countryCoords.lng,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }
          setInitialLocation(region)
          // backup if country code is not recognized
        } else {
          setInitialLocation(EL_ZONTE_COORDS)
        }
      }
    }
  }, [isInitializing, countryCode, lastRegion, loading, initialLocation])

  // todo: will be useful once btcmap adds payment tags to v4 api
  const handlePayButton = (item: MapMarker) => {
    if (isAuthed) {
      navigation.navigate("sendBitcoinDestination", { username: item.username })
    } else {
      navigation.navigate("acceptTermsAndConditions", { flow: "phone" })
    }
  }

  const formattedData = useMemo<IMarker[]>(() => {
    if (!places?.baseData) return []
    return transformPlacesToMarkers(places.baseData)
  }, [places?.baseData])

  // todo: nicer loading state
  if (isLoading || isInitializing || !initialLocation) {
    return (
      <Screen>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      </Screen>
    )
  }

  return (
    <Screen>
      {initialLocation && (
        <MapComponent
          data={formattedData}
          userLocation={initialLocation}
          handlePayButton={handlePayButton}
        />
      )}
    </Screen>
  )
}

const useStyles = makeStyles(() => ({
  loadingState: { flex: 1, justifyContent: "center", alignItems: "center" },
}))
