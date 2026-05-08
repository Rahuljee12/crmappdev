import React from 'react';
import { View, Text, type ViewProps } from 'react-native';

import { esafStyles } from './esafStyles';

type Variant = 'neutral' | 'green' | 'amber' | 'red' | 'info';

type Props = ViewProps & {
  variant?: Variant;
  children: React.ReactNode;
};

export function EsafPill({ variant = 'neutral', children, style, ...rest }: Props) {
  const variantStyle =
    variant === 'green'
      ? esafStyles.pillGreen
      : variant === 'amber'
        ? esafStyles.pillAmber
        : variant === 'red'
          ? esafStyles.pillRed
          : variant === 'info'
            ? esafStyles.pillInfo
            : esafStyles.pillNeutral;

  return (
    <View {...rest} style={[esafStyles.esafPill, variantStyle, style]}>
      <Text style={{ color: (variantStyle as any).color }}>{children}</Text>
    </View>
  );
}

