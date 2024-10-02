import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

export async function presentPaywall(): Promise<boolean> {
  try {
    const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

    switch (paywallResult) {
      case PAYWALL_RESULT.NOT_PRESENTED:
      case PAYWALL_RESULT.ERROR:
      case PAYWALL_RESULT.CANCELLED:
        return false;
      case PAYWALL_RESULT.PURCHASED:
      case PAYWALL_RESULT.RESTORED:
        return true;
      default:
        return false;
    }
  } catch (error) {
    console.error("Error presenting paywall:", error);
    return false;
  }
}

export async function presentPaywallIfNeeded() {
  // Present paywall for current offering:
  const paywallResult: PAYWALL_RESULT =
    await RevenueCatUI.presentPaywallIfNeeded({
      requiredEntitlementIdentifier: "pro",
    });
  // If you need to present a specific offering:
  //   const paywallResult: PAYWALL_RESULT =
  //     await RevenueCatUI.presentPaywallIfNeeded({
  //       offering: offering, // Optional Offering object obtained through getOfferings
  //       requiredEntitlementIdentifier: "pro",
  //     });
}
