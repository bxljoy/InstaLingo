import Purchases from "react-native-purchases";
import Constants from "expo-constants";

const REVENUE_CAT_API_KEY = Constants.expoConfig?.extra?.revenueCatApiKey;

export const initializeRevenueCat = async () => {
  if (!REVENUE_CAT_API_KEY) {
    console.error("RevenueCat API key is not set");
    return;
  }

  try {
    Purchases.configure({ apiKey: REVENUE_CAT_API_KEY });
    console.info("RevenueCat initialized successfully");
  } catch (error) {
    console.error("Error initializing RevenueCat:", error);
  }
};

export const checkSubscriptionStatus = async (): Promise<boolean> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active["pro"] !== undefined;
  } catch (error) {
    console.error("Error checking subscription status:", error);
    return false;
  }
};
