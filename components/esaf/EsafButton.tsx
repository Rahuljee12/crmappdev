import React from 'react';
import { Pressable, Text, type PressableProps } from 'react-native';

import { esafStyles } from './esafStyles';

type Variant = 'primary' | 'secondary';

type Props = PressableProps & {
  title: string;
  variant?: Variant;
};

export function EsafButton({ title, variant = 'primary', style, ...rest }: Props) {
  const btnStyle = variant === 'primary' ? esafStyles.esafBtnPrimary : esafStyles.esafBtnSecondary;
  return (
    <Pressable
      {...rest}
      style={({ pressed }) =>
        pressed
          ? ([btnStyle, style, { opacity: 0.92 }] as any)
          : ([btnStyle, style] as any)
      }
    >
      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{title}</Text>
    </Pressable>
  );
}

