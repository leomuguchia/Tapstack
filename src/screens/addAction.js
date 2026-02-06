import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SectionList,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import ActionPickerItem from '../components/ActionPickerItem';

const FILTERS = ['All', 'Device', 'Media', 'Communication', 'Productivity', 'System'];

export default function AddActionScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { onSelectAction, existingActionIds = [] } = route.params || {};
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!onSelectAction) {
      Alert.alert('Error', 'This screen requires an onSelectAction parameter', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  }, [onSelectAction, navigation]);

  if (!onSelectAction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="close" size={24} color={theme.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
            Add Action
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorState}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={theme.red} />
          <Text style={[styles.errorTitle, { color: theme.textPrimary, fontFamily: theme.fontBold, marginTop: 16 }]}>
            Configuration Error
          </Text>
          <Text style={[styles.errorText, { color: theme.textMuted, fontFamily: theme.fontRegular, marginTop: 8 }]}>
            This screen cannot be opened directly.
          </Text>
        </View>
      </View>
    );
  }

  // FIXED: Use the new Redux structure
  const availableActions = useSelector(state => 
    state.actions.discoveredActions.filter(action => 
      !state.actions.hiddenActions.includes(action.id)
    )
  );

  const sectionData = useMemo(() => {
    const filtered = availableActions.filter(action => {
      const actionCategory = action.category?.toLowerCase() || '';
      const currentFilter = filter.toLowerCase();
      const matchesFilter = currentFilter === 'all' || actionCategory === currentFilter;
      const matchesQuery = action.name.toLowerCase().includes(query.toLowerCase()) ||
                           (action.description?.toLowerCase() || '').includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });

    const grouped = {};
    filtered.forEach(action => {
      // Use the category from the action, default to 'Uncategorized'
      const category = action.category || 'Uncategorized';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(action);
    });

    return Object.entries(grouped)
      .map(([title, data]) => ({
        title: title.charAt(0).toUpperCase() + title.slice(1),
        data: data.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [availableActions, query, filter]);

  const handleSelectAction = (action) => {
    onSelectAction(action);
    navigation.goBack();
  };

  const renderItem = ({ item }) => (
    <ActionPickerItem
      title={item.name}
      description={item.description}
      icon={item.icon}
      color={item.color}
      onPress={() => handleSelectAction(item)}
    />
  );

  const renderSectionHeader = ({ section }) => (
    <Text style={[styles.section, { color: theme.textMuted }]}>
      {section.title.toUpperCase()}
    </Text>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="search-outline" size={64} color={theme.textMuted} />
      <Text style={[styles.emptyStateTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
        No actions found
      </Text>
      <Text style={[styles.emptyStateText, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
        {query ? 'Try a different search term' : 'No actions available'}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="close" size={24} color={theme.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
          Add Action
        </Text>

        <TouchableOpacity onPress={() => Alert.alert('Help', 'Select an action to add to your shortcut')}>
          <MaterialCommunityIcons name="help-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.search, { backgroundColor: theme.bgCard }]}>
        <MaterialCommunityIcons name="search" size={18} color={theme.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search actions..."
          placeholderTextColor={theme.textMuted}
          style={[styles.searchInput, { color: theme.textPrimary, fontFamily: theme.fontRegular }]}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filter, { backgroundColor: filter === f ? theme.primary : theme.bgCard }]}
            >
              <Text style={{ color: filter === f ? '#fff' : theme.textSecondary, fontFamily: theme.fontMedium, fontSize: 13 }}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {sectionData.length > 0 ? (
        <SectionList
          sections={sectionData}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={() => (
            <Text style={[styles.resultCount, { color: theme.textMuted }]}>
              {sectionData.reduce((total, section) => total + section.data.length, 0)} 
              action{sectionData.reduce((total, section) => total + section.data.length, 0) !== 1 ? 's' : ''} found
            </Text>
          )}
        />
      ) : (
        renderEmptyState()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 18 },
  search: { marginHorizontal: 20, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { fontSize: 16, flex: 1 },
  filtersContainer: { minHeight: 60 },
  filters: { paddingHorizontal: 20, paddingVertical: 14, gap: 10 },
  filter: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  resultCount: { fontSize: 12, letterSpacing: 1, marginBottom: 12, fontFamily: 'jakarta-medium' },
  section: { marginTop: 24, marginBottom: 8, fontSize: 12, letterSpacing: 1, fontFamily: 'jakarta-medium' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyStateTitle: { fontSize: 20, marginTop: 16 },
  emptyStateText: { fontSize: 15, marginTop: 8, textAlign: 'center' },
  errorState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  errorTitle: { fontSize: 20, textAlign: 'center' },
  errorText: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
