import React from 'react';
import { Text as RNText, TextProps, StyleSheet } from 'react-native';

export function Text(props: TextProps) {
  let defaultFontFamily = 'Manrope_400Regular';

  // Flatten the style array/object to read its properties and clone it to make it mutable
  const flattenedStyle = { ...StyleSheet.flatten(props.style || {}) } as any;

  // Map font weights to the specific Manrope font files
  if (
    flattenedStyle.fontWeight === 'bold' ||
    flattenedStyle.fontWeight === '700'
  ) {
    defaultFontFamily = 'Manrope_700Bold';
    delete flattenedStyle.fontWeight;
  } else if (flattenedStyle.fontWeight === '600') {
    defaultFontFamily = 'Manrope_600SemiBold';
    delete flattenedStyle.fontWeight;
  } else if (flattenedStyle.fontWeight === '500') {
    defaultFontFamily = 'Manrope_500Medium';
    delete flattenedStyle.fontWeight;
  }

  // If a specific Manrope family was already set, keep it
  if (
    flattenedStyle.fontFamily &&
    flattenedStyle.fontFamily.includes('Manrope')
  ) {
    defaultFontFamily = flattenedStyle.fontFamily;
  }

  return (
    <RNText
      {...props}
      style={[
        flattenedStyle,
        { fontFamily: defaultFontFamily },
      ]}
    />
  );
}
