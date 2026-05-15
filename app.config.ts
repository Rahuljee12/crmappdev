import type { ExpoConfig, ConfigContext } from 'expo/config';

function trimOrUndefined(v: string | undefined) {
  const t = v?.trim();
  return t ? t : undefined;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  // Whitelist env vars that must be available in release builds via Constants.expoConfig.extra.
  // NOTE: Putting secrets here will bundle them into the app. Prefer provisioning from a secure backend.
  const extra = {
    ...(config.extra ?? {}),
    EXPO_PUBLIC_EKYC_AES_KEY_BOOTSTRAP_BASE64:
      trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_AES_KEY_BOOTSTRAP_BASE64) ??
      trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_AES_KEY_BASE64),
    EXPO_PUBLIC_UIDAI_CERT_CI: trimOrUndefined(process.env.EXPO_PUBLIC_UIDAI_CERT_CI),
    EXPO_PUBLIC_ESAF_API_BASE_URL: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_API_BASE_URL),
    EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_OAUTH_BASIC_AUTH),
    EXPO_PUBLIC_EKYC_POS_ENTRY_MODE: trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_POS_ENTRY_MODE),
    EXPO_PUBLIC_EKYC_POS_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_POS_CODE),
    EXPO_PUBLIC_EKYC_CA_ID: trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_CA_ID),
    EXPO_PUBLIC_EKYC_AUTH_CA_ID: trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_AUTH_CA_ID),
    EXPO_PUBLIC_EKYC_CA_TA: trimOrUndefined(process.env.EXPO_PUBLIC_EKYC_CA_TA),
    EXPO_PUBLIC_ESAF_HOME_BRANCH_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_HOME_BRANCH_CODE),
    EXPO_PUBLIC_ESAF_LC_EMP_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_LC_EMP_CODE),
    EXPO_PUBLIC_ESAF_LG_EMP_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_LG_EMP_CODE),
    EXPO_PUBLIC_ESAF_MOBILE_COUNTRY_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_MOBILE_COUNTRY_CODE),
    EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_STATE_CODE),
    EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_CITY_CODE),
    EXPO_PUBLIC_ESAF_DEFAULT_COUNTRY_CODE: trimOrUndefined(process.env.EXPO_PUBLIC_ESAF_DEFAULT_COUNTRY_CODE),
  };

  return {
    ...config,
    extra,
  };
};
