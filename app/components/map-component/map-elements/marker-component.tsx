import React from "react"
import { IMarker } from "@app/screens/map-screen/btc-map-interface.ts"
import { Marker } from "react-native-maps"
import { View } from "react-native"
import PinIcon from "./pinIcon.tsx"
import MaterialIcon from "react-native-vector-icons/MaterialIcons"
import { useStyles } from "@app/components/map-component/index.tsx"

const MarkerComponent = React.memo(
  ({ pin, onSelect }: { pin: IMarker; onSelect: (pin: IMarker) => void }) => {
    const iconName: string = pin.icon
    const styles = useStyles()
    return (
      <Marker
        identifier={`pin-${pin.id}`}
        coordinate={pin.location}
        onSelect={() => onSelect(pin)}
        tracksViewChanges={false}
      >
        <View style={styles.iconContainer}>
          <PinIcon size={35} />
          <MaterialIcon
            name={iconName}
            size={18}
            color="#FFFFFF"
            style={styles.iconOverlay}
          />
        </View>
      </Marker>
    )
  },
)
MarkerComponent.displayName = "MarkerComponent"

export default MarkerComponent
