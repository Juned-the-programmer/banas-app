import { COLORS, RADIUS } from '@/src/theme';
import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

interface SkeletonShimmerProps {
    width?: number | `${number}%`;
    height: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonShimmer({
    width = '100%',
    height,
    borderRadius = RADIUS.MD,
    style,
}: SkeletonShimmerProps) {
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = withRepeat(
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.sin) }),
            -1,
            true
        );
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [COLORS.SKELETON, COLORS.SKELETON_SHIMMER]
        );
        return { backgroundColor };
    });

    return (
        <Animated.View
            style={[{ width: width as any, height, borderRadius }, animatedStyle, style]}
        />
    );
}
