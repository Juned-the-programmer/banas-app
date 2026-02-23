/**
 * Reusable labeled form field with inline error display.
 * Used by AddCustomerScreen for every input field.
 */
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import React, { forwardRef } from 'react';
import {
    StyleSheet,
    TextInput,
    TextInputProps,
    ViewStyle,
} from 'react-native';

interface FormFieldProps extends TextInputProps {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    containerStyle?: ViewStyle;
}

export const FormField = forwardRef<TextInput, FormFieldProps>(
    ({ label, required, error, hint, containerStyle, ...inputProps }, ref) => {
        const hasError = !!error;
        return (
            <ThemedView style={[styles.container, containerStyle]}>
                {/* Label */}
                <ThemedView style={styles.labelRow}>
                    <ThemedText style={styles.label}>{label}</ThemedText>
                    {required && <ThemedText style={styles.required}> *</ThemedText>}
                    {!required && <ThemedText style={styles.optional}> (Optional)</ThemedText>}
                </ThemedView>

                {/* Input */}
                <TextInput
                    ref={ref}
                    style={[styles.input, hasError && styles.inputError]}
                    placeholderTextColor={COLORS.TEXT_MUTED}
                    autoCapitalize="none"
                    {...inputProps}
                />

                {/* Error or hint */}
                {hasError ? (
                    <ThemedText style={styles.errorText}>{error}</ThemedText>
                ) : hint ? (
                    <ThemedText style={styles.hintText}>{hint}</ThemedText>
                ) : null}
            </ThemedView>
        );
    }
);

FormField.displayName = 'FormField';

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.MD,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.XS,
    },
    label: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    required: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.DANGER,
    },
    optional: {
        fontSize: FONT_SIZE.XS,
        color: COLORS.TEXT_MUTED,
    },
    input: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.MD,
        borderWidth: 1.5,
        borderColor: COLORS.BORDER,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM + 4,
        fontSize: FONT_SIZE.MD,
        color: COLORS.TEXT_PRIMARY,
    },
    inputError: {
        borderColor: COLORS.DANGER,
        backgroundColor: '#FFF5F5',
    },
    errorText: {
        marginTop: SPACING.XS,
        fontSize: FONT_SIZE.XS,
        color: COLORS.DANGER,
        fontWeight: FONT_WEIGHT.MEDIUM,
    },
    hintText: {
        marginTop: SPACING.XS,
        fontSize: FONT_SIZE.XS,
        color: COLORS.TEXT_MUTED,
    },
});
