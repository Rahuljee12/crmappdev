import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export function PlaceholderTab({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Ionicons name={icon} size={28} color="#1B348B" />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>This tab is ready for the next step.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#F4F7FB',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#142A60',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#667085',
    textAlign: 'center',
  },
});

