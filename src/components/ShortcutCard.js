import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ShortcutCard({
  shortcut,
  title,
  subtitle,
  icon,
  color,
  isFavorite = false,
  isCreateCard = false,
  isDefault = false,
  runCount = 0,
  onRun,
  onPress,
  onLongPress,
  onDeletePress,
  isSelected = false,
  closeDelete
}) {
  const { theme } = useTheme();

  if (isCreateCard) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.card,
          styles.createCard,
          {
            backgroundColor: theme.bgCard + '80',
            borderColor: theme.borderSubtle,
            borderStyle: 'dashed'
          }
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: theme.bgCard }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontMedium }]}>
          {title}
        </Text>

        <Text style={[styles.subtitle, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
          {subtitle}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={isSelected ? undefined : onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={[
        styles.card,
        {
          backgroundColor: theme.bgCard,
          transform: [{ scale: isSelected ? 0.98 : 1 }]
        }
      ]}
    >
      {/* Transparent overlay when selected */}
      {isSelected && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeDelete}
          style={styles.selectionOverlay}
        />
      )}

      {/* Delete button (above overlay) */}
      {isSelected && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={onDeletePress}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.deleteButtonInner,
              { backgroundColor: isDefault ? theme.orange : theme.red }
            ]}
          >
            <Ionicons name="remove" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

      {/* Card content */}
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>

        <View style={styles.headerIcons}>
          {isFavorite && (
            <Ionicons
              name="star"
              size={14}
              color="#F59E0B"
              style={styles.favoriteIcon}
            />
          )}
          {isDefault && (
            <Ionicons
              name="lock-closed"
              size={12}
              color={theme.textMuted}
              style={styles.defaultIcon}
            />
          )}
        </View>
      </View>

      <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontMedium }]}>
        {title}
      </Text>

      <View style={styles.statsRow}>
        <Text style={[styles.subtitle, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
          {subtitle}
        </Text>
        {runCount > 0 && (
          <Text style={[styles.runCount, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
            • {runCount}x
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={[styles.runButton, { backgroundColor: color }]}
        onPress={isSelected ? undefined : onRun}
        activeOpacity={0.9}
      >
        <Ionicons name="play" size={14} color="#fff" />
        <Text style={[styles.runText, { fontFamily: theme.fontMedium }]}>
          Run
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },

  createCard: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },

  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 10,
  },

  deleteButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  favoriteIcon: {
    marginTop: -4,
  },

  defaultIcon: {
    opacity: 0.7,
  },

  title: {
    fontSize: 15,
  },

  subtitle: {
    fontSize: 13,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  runCount: {
    fontSize: 12,
    marginLeft: 4,
  },

  runButton: {
    marginTop: 16,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },

  runText: {
    color: '#fff',
    fontSize: 14,
  },
});
