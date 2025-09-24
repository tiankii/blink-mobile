import React, { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import { ActivityIndicator, TouchableOpacity, View } from "react-native"
import { FlatList } from "react-native-gesture-handler"
import Icon from "react-native-vector-icons/Ionicons"

import { gql } from "@apollo/client"
import { GaloyPrimaryButton } from "@app/components/atomic/galoy-primary-button"
import { Screen } from "@app/components/screen"
import { LNURL_DOMAINS } from "@app/config"
import { useAppConfig } from "@app/hooks"
import {
  UserContact,
  useAccountDefaultWalletLazyQuery,
  useRealtimePriceQuery,
  useSendBitcoinDestinationQuery,
} from "@app/graphql/generated"
import { useIsAuthed } from "@app/graphql/is-authed-context"
import { useI18nContext } from "@app/i18n/i18n-react"
import { RootStackParamList } from "@app/navigation/stack-param-lists"
import { logParseDestinationResult } from "@app/utils/analytics"
import { toastShow } from "@app/utils/toast"
import { PaymentType } from "@blinkbitcoin/blink-client"
import Clipboard from "@react-native-clipboard/clipboard"
import crashlytics from "@react-native-firebase/crashlytics"
import { RouteProp, useNavigation } from "@react-navigation/native"
import { StackNavigationProp } from "@react-navigation/stack"
import { SearchBar } from "@rn-vui/base"
import { makeStyles, useTheme, Text, ListItem } from "@rn-vui/themed"

import { testProps } from "../../utils/testProps"
import { ConfirmDestinationModal } from "./confirm-destination-modal"
import { DestinationInformation } from "./destination-information"
import { parseDestination } from "./payment-destination"
import {
  DestinationDirection,
  InvalidDestinationReason,
} from "./payment-destination/index.types"
import {
  DestinationState,
  SendBitcoinActions,
  sendBitcoinDestinationReducer,
  SendBitcoinDestinationState,
} from "./send-bitcoin-reducer"
import {
  PhoneInput,
  PhoneInputInfo,
} from "@app/components/phone-input"
import { GaloyIcon } from "@app/components/atomic/galoy-icon"

gql`
  query sendBitcoinDestination {
    globals {
      network
    }
    me {
      id
      defaultAccount {
        id
        wallets {
          id
        }
      }
      contacts {
        id
        handle
        username
        alias
        transactionsCount
      }
    }
  }

  query accountDefaultWallet($walletCurrency: WalletCurrency, $username: Username!) {
    accountDefaultWallet(walletCurrency: $walletCurrency, username: $username) {
      id
    }
  }
`

export const defaultDestinationState: SendBitcoinDestinationState = {
  unparsedDestination: "",
  destinationState: DestinationState.Entering,
}

type Props = {
  route: RouteProp<RootStackParamList, "sendBitcoinDestination">
}
type TInputType = "search" | "phone" | null

const wordMatchesContact = (searchWord: string, contact: UserContact): boolean => {
  let contactPrettyNameMatchesSearchWord: boolean

  const contactNameMatchesSearchWord = contact.handle
    .toLowerCase()
    .includes(searchWord.toLowerCase())

  if (contact.handle) {
    contactPrettyNameMatchesSearchWord = contact.handle
      .toLowerCase()
      .includes(searchWord.toLowerCase())
  } else {
    contactPrettyNameMatchesSearchWord = false
  }

  return contactNameMatchesSearchWord || contactPrettyNameMatchesSearchWord
}

const isPhoneNumber = (handle: string): boolean => {
  if (handle.startsWith("+")) {
    return true
  }
  const first4Chars = handle.substring(0, 4)
  const areFirst4Digits = /^\d{4}$/.test(first4Chars)
  return areFirst4Digits
}

const matchCheck = (
  newSearchText: string,
  allContacts: UserContact[],
  activeInput: TInputType,
): UserContact[] => {
  if (newSearchText.length > 0) {
    const searchWordArray = newSearchText
      .split(" ")
      .filter((text) => text.trim().length > 0)

    let filteredContacts = allContacts

    // Filtrar contactos según el input activo
    if (activeInput === "search") {
      // Solo contactos que NO sean números de teléfono
      filteredContacts = allContacts.filter((contact) => !isPhoneNumber(contact.handle))
    } else if (activeInput === "phone") {
      // Solo contactos que SÍ sean números de teléfono
      filteredContacts = allContacts.filter((contact) => isPhoneNumber(contact.handle))
    }

    const matchingContacts = filteredContacts.filter((contact) =>
      searchWordArray.some((word) => wordMatchesContact(word, contact)),
    )

    return matchingContacts
  }

  // Sin búsqueda, aplicar filtros según el input activo
  if (activeInput === "search") {
    return allContacts.filter((contact) => !isPhoneNumber(contact.handle))
  } else if (activeInput === "phone") {
    return allContacts.filter((contact) => isPhoneNumber(contact.handle))
  }

  return allContacts
}

const SendBitcoinDestinationScreen: React.FC<Props> = ({ route }) => {
  const styles = usestyles()
  const {
    theme: { colors },
  } = useTheme()

  const navigation =
    useNavigation<StackNavigationProp<RootStackParamList, "sendBitcoinDestination">>()
  const isAuthed = useIsAuthed()

  const [destinationState, dispatchDestinationStateAction] = useReducer(
    sendBitcoinDestinationReducer,
    defaultDestinationState,
  )

  const [activeInput, setActiveInput] = useState<TInputType>(null)
  const [defaultPhoneInputInfo, setDefaultPhoneInputInfo] =
    useState<PhoneInputInfo | null>(null)

  const [goToNextScreenWhenValid, setGoToNextScreenWhenValid] = React.useState(false)

  const { loading, data } = useSendBitcoinDestinationQuery({
    fetchPolicy: "cache-and-network",
    returnPartialData: true,
    skip: !isAuthed,
  })

  // forcing price refresh
  useRealtimePriceQuery({
    fetchPolicy: "network-only",
    skip: !isAuthed,
  })

  const wallets = useMemo(
    () => data?.me?.defaultAccount.wallets,
    [data?.me?.defaultAccount.wallets],
  )
  const bitcoinNetwork = useMemo(() => data?.globals?.network, [data?.globals?.network])
  const contacts = useMemo(() => data?.me?.contacts ?? [], [data?.me?.contacts])

  const { LL } = useI18nContext()
  const [accountDefaultWalletQuery] = useAccountDefaultWalletLazyQuery({
    fetchPolicy: "no-cache",
  })

  const [matchingContacts, setMatchingContacts] = useState<UserContact[]>([])

  const allContacts: UserContact[] = useMemo(
    () =>
      (contacts.slice() ?? []).sort((a, b) => {
        return b.transactionsCount - a.transactionsCount
      }),
    [contacts],
  )

  const {
    appConfig: {
      galoyInstance: { lnAddressHostname },
    },
  } = useAppConfig()

  const [selectedId, setSelectedId] = useState("")

  const handleSelection = (id: string) => {
    if (selectedId === id) setSelectedId("")
    else setSelectedId(id)
  }

  const reset = useCallback(() => {
    dispatchDestinationStateAction({
      type: "set-unparsed-destination",
      payload: { unparsedDestination: "" },
    })
    setGoToNextScreenWhenValid(false)
    setSelectedId("")
    setMatchingContacts(allContacts)
  }, [allContacts])

  let ListEmptyContent: React.ReactNode

  if (loading) {
    ListEmptyContent = (
      <View style={styles.activityIndicatorContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  } else if (
    // TODO: refactor: ideally this should come from destinationState.destination
    // but currently this is not validated when the user is typing,
    // only validated on paste, or when the user is pressing the send button
    // so there is no way to dynamically know if this is a bitcoin or lightning or lnurl
    // until a refactor is done
    destinationState.unparsedDestination.startsWith("bc1") ||
    destinationState.unparsedDestination.startsWith("tb1") ||
    destinationState.unparsedDestination.startsWith("lnurl") ||
    destinationState.unparsedDestination.startsWith("lightning:") ||
    destinationState.unparsedDestination.startsWith("bitcoin:") ||
    destinationState.unparsedDestination.startsWith("1") ||
    destinationState.unparsedDestination.startsWith("3") ||
    destinationState.unparsedDestination.startsWith("lnbc1") ||
    // if the user is typing a lightning address
    // ideally we should filter from the rules below contact from the same instance
    // ie: test and test@blink.sv are the same user
    // but anyhow, more refactor is needed for contacts to have extenral contacts
    destinationState.unparsedDestination.includes("@")
  ) {
    ListEmptyContent = <></>
  } else if (allContacts.length > 0) {
    ListEmptyContent = <></>
  } else {
    ListEmptyContent = (
      <View style={styles.emptyListNoContacts}>
        <Text
          {...testProps(LL.PeopleScreen.noContactsTitle())}
          style={styles.emptyListTitle}
        >
          {LL.PeopleScreen.noContactsTitle()}
        </Text>
        <Text style={styles.emptyListText}>{LL.PeopleScreen.noContactsYet()}</Text>
      </View>
    )
  }

  const updateMatchingContacts = useCallback(
    (newSearchText: string) => {
      const matching = matchCheck(newSearchText, allContacts, activeInput)
      setMatchingContacts(matching)
    },
    [allContacts, activeInput], // Agregar activeInput como dependencia
  )

  const willInitiateValidation = React.useCallback(() => {
    if (!bitcoinNetwork || !wallets || !contacts) {
      return false
    }

    dispatchDestinationStateAction({
      type: SendBitcoinActions.SetValidating,
      payload: {},
    })
    return true
  }, [bitcoinNetwork, wallets, contacts])

  const validateDestination = React.useCallback(
    async (rawInput: string) => {
      // extra check for typescript even though these were checked in willInitiateValidation
      if (!bitcoinNetwork || !wallets || !contacts) {
        return
      }

      const destination = await parseDestination({
        rawInput,
        myWalletIds: wallets.map((wallet) => wallet.id),
        bitcoinNetwork,
        lnurlDomains: LNURL_DOMAINS,
        accountDefaultWalletQuery,
      })
      logParseDestinationResult(destination)

      if (destination.valid === false) {
        if (destination.invalidReason === InvalidDestinationReason.SelfPayment) {
          dispatchDestinationStateAction({
            type: SendBitcoinActions.SetUnparsedDestination,
            payload: {
              unparsedDestination: rawInput,
            },
          })
          navigation.navigate("conversionDetails")
          return
        }

        dispatchDestinationStateAction({
          type: SendBitcoinActions.SetInvalid,
          payload: {
            invalidDestination: destination,
            unparsedDestination: rawInput,
          },
        })
        return
      }

      if (
        destination.destinationDirection === DestinationDirection.Send &&
        destination.validDestination.paymentType === PaymentType.Intraledger
      ) {
        if (
          !contacts
            .map((contact) => contact.handle.toLowerCase())
            .includes(destination.validDestination.handle.toLowerCase())
        ) {
          dispatchDestinationStateAction({
            type: SendBitcoinActions.SetRequiresUsernameConfirmation,
            payload: {
              validDestination: destination,
              unparsedDestination: rawInput,
              confirmationUsernameType: {
                type: "new-username",
                username: destination.validDestination.handle,
              },
            },
          })
          return
        }
      }
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetValid,
        payload: {
          validDestination: destination,
          unparsedDestination: rawInput,
        },
      })
    },
    [
      navigation,
      accountDefaultWalletQuery,
      dispatchDestinationStateAction,
      bitcoinNetwork,
      wallets,
      contacts,
    ],
  )

  const handleChangeText = useCallback(
    (newDestination: string) => {
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetUnparsedDestination,
        payload: { unparsedDestination: newDestination },
      })
      setGoToNextScreenWhenValid(false)
    },
    [dispatchDestinationStateAction, setGoToNextScreenWhenValid],
  )

  useEffect(() => {
    const filteredContacts = matchCheck("", allContacts, activeInput)
    setMatchingContacts(filteredContacts)
  }, [allContacts, activeInput])

  useEffect(() => {
    if (
      !goToNextScreenWhenValid ||
      destinationState.destinationState !== DestinationState.Valid
    ) {
      return
    }

    if (
      destinationState?.destination?.destinationDirection === DestinationDirection.Send
    ) {
      // go to send bitcoin details screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("sendBitcoinDetails", {
        paymentDestination: destinationState.destination,
      })
      return
    }

    if (
      destinationState?.destination?.destinationDirection === DestinationDirection.Receive
    ) {
      // go to redeem bitcoin screen
      setGoToNextScreenWhenValid(false)
      navigation.navigate("redeemBitcoinDetail", {
        receiveDestination: destinationState.destination,
      })
    }
  }, [destinationState, goToNextScreenWhenValid, navigation, setGoToNextScreenWhenValid])

  // setTimeout here allows for the main JS thread to update the UI before the long validateDestination call
  const waitAndValidateDestination = React.useCallback(
    (input: string) => {
      setTimeout(() => validateDestination(input), 0)
    },
    [validateDestination],
  )

  const initiateGoToNextScreen = React.useCallback(
    async (input: string) => {
      if (willInitiateValidation()) {
        setGoToNextScreenWhenValid(true)
        waitAndValidateDestination(input)
      }
    },
    [willInitiateValidation, waitAndValidateDestination],
  )

  useEffect(() => {
    if (route.params?.payment) {
      handleChangeText(route.params?.payment)
      initiateGoToNextScreen(route.params?.payment)
    }
  }, [route.params?.payment, initiateGoToNextScreen, handleChangeText])

  useEffect(() => {
    // If we scan a QR code encoded with a payment url for a specific user e.g. https://{domain}/{username}
    // then we want to detect the username as the destination
    if (route.params?.username) {
      handleChangeText(route.params?.username)
    }
  }, [route.params?.username, handleChangeText])

  useEffect(() => {
    if (route.params?.scanPressed) {
      handleScanPress()
    }
  }, [route.params?.scanPressed])

  useEffect(() => {
    if (!defaultPhoneInputInfo) return
    if (
      destinationState.destinationState == DestinationState.Validating ||
      destinationState.destinationState == DestinationState.Pasting
    )
      return

    const { rawPhoneNumber } = defaultPhoneInputInfo
    console.log(defaultPhoneInputInfo)

    handleChangeText(rawPhoneNumber)
    updateMatchingContacts(rawPhoneNumber)
  }, [defaultPhoneInputInfo])

  const handlePaste = async () => {
    if (destinationState.destinationState == DestinationState.Validating) return
    onFocusedInput("search")
    try {
      const clipboard = await Clipboard.getString()
      updateMatchingContacts(clipboard)
      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetUnparsedPastedDestination,
        payload: {
          unparsedDestination: clipboard,
        },
      })
      if (willInitiateValidation()) {
        waitAndValidateDestination(clipboard)
      }
    } catch (err) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      toastShow({
        type: "error",
        message: (translations) =>
          translations.SendBitcoinDestinationScreen.clipboardError(),
        LL,
      })
    }
  }

  const handlePastePhone = async () => {
    if (destinationState.destinationState == DestinationState.Validating) return
    onFocusedInput("phone")
    try {
      const clipboard = await Clipboard.getString()

      dispatchDestinationStateAction({
        type: SendBitcoinActions.SetUnparsedPastedDestination,
        payload: {
          unparsedDestination: clipboard,
        },
      })
      if (willInitiateValidation()) {
        waitAndValidateDestination(clipboard)
      }
    } catch (err) {
      if (err instanceof Error) {
        crashlytics().recordError(err)
      }
      toastShow({
        type: "error",
        message: (translations) =>
          translations.SendBitcoinDestinationScreen.clipboardError(),
        LL,
      })
    }
  }

  const handleContactPress = (item: UserContact) => {
    if (destinationState.destinationState == DestinationState.Validating) return
    const handle = item?.handle?.trim() ?? ""
    const displayHandle =
      handle && !handle.includes("@") ? `${handle}@${lnAddressHostname}` : handle

    handleSelection(item.id)

    dispatchDestinationStateAction({
      type: SendBitcoinActions.SetUnparsedDestination,
      payload: { unparsedDestination: displayHandle },
    })
    initiateGoToNextScreen(displayHandle)
  }

  const handleScanPress = () => {
    setSelectedId("")
    navigation.setParams({ scanPressed: undefined })
    dispatchDestinationStateAction({
      type: SendBitcoinActions.SetUnparsedDestination,
      payload: { unparsedDestination: "" },
    })
    navigation.navigate("scanningQRCode")
  }

  const resetInput = () => {
    reset()
    setDefaultPhoneInputInfo(null)
  }

  const onFocusedInput = (inputType: TInputType) => {
    if (activeInput === inputType) return
    setActiveInput(inputType)
    resetInput()
  }

  const inputContainerStyle = React.useMemo(() => {
    switch (destinationState.destinationState) {
      case DestinationState.Validating:
        return styles.enteringInputContainer
      case DestinationState.Invalid:
        return styles.errorInputContainer
      case DestinationState.RequiresUsernameConfirmation:
        return styles.warningInputContainer
      case DestinationState.Valid:
        if (!destinationState.confirmationUsernameType) {
          return styles.validInputContainer
        }
        return styles.warningInputContainer
      default:
        return {}
    }
  }, [
    destinationState.destinationState,
    destinationState.confirmationUsernameType,
    styles,
  ])

  return (
    <Screen keyboardOffset="navigationHeader" keyboardShouldPersistTaps="handled">
      <ConfirmDestinationModal
        destinationState={destinationState}
        dispatchDestinationStateAction={dispatchDestinationStateAction}
      />
      <View style={styles.sendBitcoinDestinationContainer}>
        <View
          style={[
            styles.fieldBackground,
            activeInput === "search" && inputContainerStyle,
            activeInput === "phone" && styles.disabledInput,
          ]}
        >
          <SearchBar
            {...testProps(LL.SendBitcoinScreen.placeholder())}
            placeholder={LL.SendBitcoinScreen.placeholder()}
            value={activeInput === "search" ? destinationState.unparsedDestination : ""}
            onFocus={() => onFocusedInput("search")}
            onChangeText={(text) => {
              handleChangeText(text)
              updateMatchingContacts(text)
            }}
            onSubmitEditing={() =>
              willInitiateValidation() &&
              waitAndValidateDestination(destinationState.unparsedDestination)
            }
            platform="default"
            showLoading={false}
            containerStyle={[styles.searchBarContainer]}
            inputContainerStyle={[styles.searchBarInputContainerStyle]}
            inputStyle={styles.searchBarText}
            searchIcon={<></>}
            autoCapitalize="none"
            autoCorrect={false}
            clearIcon={
              destinationState.unparsedDestination && activeInput === "search" ? (
                <Icon
                  name="close"
                  size={24}
                  onPress={resetInput}
                  color={styles.icon.color}
                />
              ) : (
                <></>
              )
            }
          />
          {!destinationState.unparsedDestination || activeInput === "phone" ? (
            <TouchableOpacity onPress={handlePaste} disabled={activeInput === "phone"}>
              <View style={styles.iconContainer}>
                <Text color={colors.primary} type="p2">
                  {LL.common.paste()}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </View>
        <View style={styles.textSeparator}>
          <View style={styles.line}></View>
          <Text
            style={styles.textInformation}
            type="p2"
            ellipsizeMode="middle"
            numberOfLines={1}
          >
            {LL.SendBitcoinScreen.orBySMS()}
          </Text>
        </View>
        <PhoneInput
          key={1}
          rightIcon={
            destinationState.unparsedDestination && activeInput == "phone" ? (
              <Icon name="close" size={24} onPress={resetInput} color={colors.primary} />
            ) : (
              <TouchableOpacity
                onPress={handlePastePhone}
                disabled={activeInput === "search"}
              >
                <Text color={colors.primary} type="p2">
                  {LL.common.paste()}
                </Text>
              </TouchableOpacity>
            )
          }
          onChangeText={(text) => {
            handleChangeText(text)
          }}
          onChangeInfo={(e) => {
            setDefaultPhoneInputInfo(e)
          }}
          value={activeInput === "phone" ? destinationState.unparsedDestination : ""}
          isDisabled={activeInput === "search"}
          onFocus={() => onFocusedInput("phone")}
          onSubmitEditing={() =>
            willInitiateValidation() &&
            waitAndValidateDestination(destinationState.unparsedDestination)
          }
          inputContainerStyle={activeInput === "phone" && inputContainerStyle}
          bgColor={colors.grey6}
        />
        {matchingContacts.length > 0 && (
          <View style={[styles.textSeparator, styles.lastInfoTextStyle]}>
            <View style={styles.line}></View>
            <Text style={styles.textInformation} type="p2">
              {LL.SendBitcoinScreen.orSaved()}
            </Text>
          </View>
        )}
        <DestinationInformation destinationState={destinationState} />
        <FlatList
          style={styles.flatList}
          contentContainerStyle={styles.flatListContainer}
          data={matchingContacts}
          extraData={selectedId}
          ListEmptyComponent={ListEmptyContent}
          renderItem={({ item }) => {
            const handle = item?.handle?.trim() ?? ""
            const displayHandle =
              handle && !handle.includes("@") ? `${handle}@${lnAddressHostname}` : handle

            return (
              <ListItem
                key={item.handle}
                style={styles.item}
                containerStyle={[
                  matchingContacts.length > 1 ? styles.itemStyleContainer : {},
                  item.id === selectedId
                    ? styles.selectedContainer
                    : styles.itemContainer,
                ]}
                onPress={() => handleContactPress(item)}
              >
                <GaloyIcon name={"user"} size={24} />
                <ListItem.Content>
                  <ListItem.Title style={styles.itemText}>{displayHandle}</ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )
          }}
          keyExtractor={(item) => item.handle}
        />
        <View style={styles.buttonContainer}>
          <GaloyPrimaryButton
            title={
              destinationState.unparsedDestination
                ? LL.common.next()
                : LL.SendBitcoinScreen.destinationRequired()
            }
            loading={destinationState.destinationState === DestinationState.Validating}
            disabled={
              destinationState.destinationState === DestinationState.Invalid ||
              !destinationState.unparsedDestination
            }
            onPress={() => initiateGoToNextScreen(destinationState.unparsedDestination)}
          />
        </View>
      </View>
    </Screen>
  )
}

export default SendBitcoinDestinationScreen

const usestyles = makeStyles(({ colors }) => ({
  sendBitcoinDestinationContainer: {
    padding: 20,
    flex: 1,
  },
  fieldBackground: {
    flexDirection: "row",
    overflow: "hidden",
    backgroundColor: colors.grey6,
    borderRadius: 10,
    borderColor: colors.transparent,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
  },
  enteringInputContainer: {},
  errorInputContainer: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  validInputContainer: {
    borderColor: colors._green,
    borderWidth: 1,
  },
  warningInputContainer: {
    borderColor: colors.warning,
    borderWidth: 1,
  },
  buttonContainer: {
    marginTop: 26,
    flex: 0,
    justifyContent: "flex-end",
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: colors.black,
  },
  fieldTitleText: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  searchBarContainer: {
    flex: 1,
    backgroundColor: colors.transparent,
    borderBottomColor: colors.transparent,
    borderTopColor: colors.transparent,
    padding: 0,
  },
  searchBarInputContainerStyle: {
    backgroundColor: colors.transparent,
    marginLeft: -10,
  },
  searchBarText: {
    color: colors.black,
    textDecorationLine: "none",
  },
  icon: {
    color: colors.primary,
  },
  activityIndicatorContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  emptyListNoContacts: {
    marginHorizontal: 12,
    marginTop: 32,
  },
  emptyListText: {
    fontSize: 18,
    marginTop: 30,
    textAlign: "center",
    color: colors.black,
  },
  emptyListTitle: {
    color: colors.warning,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  flatList: {
    flex: 1,
    marginHorizontal: -30,
  },
  flatListContainer: {
    margin: 0,
  },
  item: {
    marginHorizontal: 32,
    marginBottom: 16,
  },
  itemContainer: {
    backgroundColor: colors.white,
  },
  itemStyleContainer: {
    borderColor: colors.grey4,
    borderBottomWidth: 2,
  },
  selectedContainer: {
    borderRadius: 8,
    backgroundColor: colors.grey6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  itemText: { color: colors.black },
  textSeparator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 40,
  },
  lastInfoTextStyle: {
    marginBottom: 30,
  },
  line: {
    backgroundColor: colors.grey4,
    height: 2,
    borderRadius: 10,
    flex: 1,
    position: "relative",
  },
  textInformation: {
    position: "absolute",
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    color: colors.grey1,
    display: "flex",
    minWidth: 120,
    textAlign: "center",
  },
  disabledInput: { opacity: 0.6 },
  borderFocusedInput: {
    borderColor: colors._green,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
}))
