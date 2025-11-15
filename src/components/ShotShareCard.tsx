/* eslint-disable react-native/sort-styles */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { Bean, Machine, Shot } from '@types';
import { colors } from '../themes/colors';
import { formatBeanName } from '../utils/formatBeanName';
import { getMachineName } from '../utils/getMachineName';

import { LinearGradient } from 'expo-linear-gradient';
import LogoSvg from './LogoSvg';
import RoastingIndicator from './RoastingIndicator';
import SvgIcon from './SvgIcon';

interface ShotShareCardProps {
  shot: Shot;
  bean?: Bean;
  machine?: Machine;
  showMetrics: boolean;
  showBeanInfo: boolean;
  showMachineInfo: boolean;
  photoUri: string;
}

/**
 * ShotShareCard - A beautiful shot card designed for sharing on Instagram/social media
 * This component is meant to be captured as an image using react-native-view-shot
 */
const ShotShareCard: React.FC<ShotShareCardProps> = ({
  shot,
  bean,
  machine,
  showMetrics,
  showBeanInfo,
  showMachineInfo,
  photoUri,
}) => {
  return (
    <View style={styles.container}>
      {/* Shot Photo */}
      <Image
        source={{ uri: photoUri }}
        style={styles.photo}
        resizeMode='cover'
      />

      {/* Shot information overlay */}
      <View style={styles.infoOverlay}>
        {/* top section */}

        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'transparent']}
          style={styles.infoOverlayTop}
        >
          <View style={styles.titleContainer}>
            <LogoSvg size={60} color={colors.white} />
          </View>
          {/* Bean Info */}
          {showBeanInfo && (
            <View style={styles.beanInfo}>
              <Text style={styles.beanName}>{formatBeanName(bean)}</Text>
              {bean?.roastLevel && (
                <RoastingIndicator
                  roastLevel={bean.roastLevel}
                  size='md'
                  compact={true}
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          )}
          {/* Machine Info */}
          {showMachineInfo && (
            <View style={styles.machineInfo}>
              <Text style={styles.machineName}>
                {getMachineName(machine, {
                  showDeleted: false,
                  useNickname: false,
                })}
              </Text>
            </View>
          )}
        </LinearGradient>
        {/* bottom section */}
        {showMetrics ? (
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.6)']}
            style={styles.infoOverlayBottom}
          >
            <View style={styles.shotMetrics}>
              <View style={styles.metric}>
                <SvgIcon name='dial' size={26} color={colors.white} />
                <Text style={styles.metricValue}>
                  {shot.grindSetting || 'N/A'}
                </Text>
              </View>
              <View style={styles.metric}>
                <SvgIcon name='scale' size={26} color={colors.white} />
                <Text style={styles.metricValue}>{shot.dose_g}g</Text>
              </View>
              <View style={styles.metric}>
                <SvgIcon name='water' size={26} color={colors.white} />
                <Text style={styles.metricValue}>{shot.yield_g}g</Text>
              </View>
              <View style={styles.metric}>
                <SvgIcon name='ratio' size={26} color={colors.white} />
                <Text style={styles.metricValue}>
                  {shot.ratio ? `1:${shot.ratio.toFixed(1)}` : 'N/A'}
                </Text>
              </View>
              {shot.shotTime_s ? (
                <View style={styles.metric}>
                  <SvgIcon name='timer' size={26} color={colors.white} />
                  <Text style={styles.metricValue}>
                    {shot.shotTime_s ? `${shot.shotTime_s}s` : 'N/A'}
                  </Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.white,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    color: colors.white,
    flexDirection: 'column',
  },
  infoOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 20,
    gap: 8,
    minHeight: 60,
  },
  infoOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingBottom: 20,
    gap: 10,
  },
  beanInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  beanName: {
    color: colors.white,
    fontSize: 14,
  },
  machineInfo: {
    flexDirection: 'row',
    gap: 8,
  },
  machineName: {
    color: colors.white,
    fontSize: 14,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
  shotMetrics: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  photo: {
    aspectRatio: 1,
    height: '100%',
    width: '100%',
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
});

export default ShotShareCard;
