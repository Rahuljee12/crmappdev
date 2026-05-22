import { Image, View } from 'react-native';

import logo from '@/assets/images/icon.png';
import { globalStyles } from '@/theme/globalStyles';

export function AppHeader() {
  return (
    <View style={globalStyles.navHeader}>
      <Image
        source={logo}
        resizeMode="contain"
        style={globalStyles.navHeaderLogo}
      />

      <View style={globalStyles.navHeaderStatusDot} />
    </View>
  );
}
