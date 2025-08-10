import { FC, useMemo, useState, useCallback } from "react"
import { View, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { CheckBox, makeStyles, Text, useTheme } from "@rneui/themed"
import Icon from "react-native-vector-icons/Ionicons"
import {
  Category,
  categoryNames,
  categoryIcons,
} from "@app/components/map-component/categories.ts"
import MaterialIcon from "react-native-vector-icons/MaterialIcons"

type FiltersContentProps = {
  closeModal: () => void
  filters: Set<Category>
  setFilters: (filters: Set<Category>) => void
}

export const FiltersContent: FC<FiltersContentProps> = ({
  closeModal,
  filters,
  setFilters,
}) => {
  const styles = useStyles()
  const {
    theme: { colors },
  } = useTheme()
  const { height: screenHeight } = Dimensions.get("window")

  const [tempFilters, setTempFilters] = useState(() => new Set(filters))

  const availableCategories = useMemo(() => {
    return Object.keys(categoryNames).map((key) => {
      const category = parseInt(key, 10) as Category
      return {
        category,
        checked: tempFilters.has(category),
      }
    })
  }, [tempFilters])

  const applyAndClose = useCallback(() => {
    setFilters(new Set(tempFilters))
    closeModal()
  }, [tempFilters, setFilters, closeModal])

  const toggleCheck = useCallback((category: Category) => {
    setTempFilters((prev) => {
      const newFilters = new Set(prev)
      if (newFilters.has(category)) {
        newFilters.delete(category)
      } else {
        newFilters.add(category)
      }
      return newFilters
    })
  }, [])

  const selectAll = useCallback(() => {
    const allCategories = Object.values(Category).filter(
      (value) => typeof value === "number",
    ) as Category[]
    setTempFilters(new Set(allCategories))
  }, [])

  return (
    <View style={{ minHeight: screenHeight - 300, maxHeight: screenHeight - 300 }}>
      <View style={styles.titleContent}>
        <Text style={styles.titleModal}>Categories filters</Text>
        <Icon
          color="grey"
          name="close"
          size={22}
          style={styles.closeIcon}
          onPress={closeModal}
        />
      </View>

      <Text color="grey">Choose which categories you would like to show</Text>

      <ScrollView style={styles.contentBox}>
        {availableCategories.map((category) => (
          <View key={category.category} style={styles.listContent}>
            <View style={styles.listCheck}>
              <MaterialIcon
                name={categoryIcons[category.category] || "help-outline"}
                size={22}
                style={styles.listIcon}
              />
              <Text style={styles.titleFilter}>{categoryNames[category.category]}</Text>
            </View>
            <CheckBox
              checked={category.checked}
              onPress={() => toggleCheck(category.category)}
              containerStyle={styles.checkBox}
              checkedIcon={<Icon name="checkbox" color={colors.primary} size={22} />}
              uncheckedIcon={<Icon name="square-outline" color="grey" size={22} />}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={selectAll}>
          <Text color={colors.primary}>Select All</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={applyAndClose}>
          <Text color={colors.primary}>Apply</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const useStyles = makeStyles(({ colors }) => ({
  titleContent: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
  titleModal: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
  },
  contentBox: {
    paddingTop: 20,
  },
  listContent: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    marginBottom: 10,
  },
  listCheck: {
    alignItems: "center",
    flexDirection: "row",
  },
  titleFilter: {
    fontSize: 15,
  },
  listIcon: {
    color: colors.black,
    paddingRight: 7,
  },
  checkBox: {
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
    right: -10,
  },
  closeIcon: {
    paddingHorizontal: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
}))
