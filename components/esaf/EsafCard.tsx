import React from 'react';
import { View, type ViewProps } from 'react-native';

import { esafStyles } from './esafStyles';

export function EsafCard(props: ViewProps) {
  return <View {...props} style={[esafStyles.esafCard, props.style]} />;
}

