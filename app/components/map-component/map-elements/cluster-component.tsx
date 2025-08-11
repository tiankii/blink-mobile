import React from "react"
import { Marker } from "react-native-maps"
import { View } from "react-native"
import { Text } from "@rneui/themed"
import { useStyles } from "../index"
import { supercluster } from "react-native-clusterer"
import { IMarker } from "@app/screens/map-screen/btc-map-interface.ts"

const ClusterComponent = React.memo(
  ({
    cluster,
    onPress,
  }: {
    cluster: supercluster.ClusterFeature<IMarker>
    onPress: (cluster: supercluster.ClusterFeature<IMarker>) => void
  }) => {
    const [longitude, latitude] = cluster.geometry.coordinates
    const coordinate = { latitude, longitude }
    const styles = useStyles()
    return (
      <Marker
        identifier={`cluster-${cluster.properties.cluster_id}`}
        coordinate={coordinate}
        onPress={() => onPress(cluster)}
      >
        <View style={styles.clusterContainer}>
          <Text style={styles.clusterText}>{cluster.properties.point_count}</Text>
        </View>
      </Marker>
    )
  },
)
ClusterComponent.displayName = "ClusterComponent"

export default ClusterComponent
