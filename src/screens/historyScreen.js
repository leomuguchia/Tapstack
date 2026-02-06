// screens/HistoryScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import { 
  selectAllShortcutRuns,
  selectShortcutStats,
  selectAllShortcuts
} from '../store/shortcutsSlice';

const { width } = Dimensions.get('window');

export default function HistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'today', 'week', 'month'
  
  const allRuns = useSelector(selectAllShortcutRuns);
  const stats = useSelector(selectShortcutStats);
  const allShortcuts = useSelector(selectAllShortcuts);
  
  // Filter runs based on time filter
  const filteredRuns = React.useMemo(() => {
    if (timeFilter === 'all') return allRuns;
    
    const now = Date.now();
    let cutoffTime;
    
    switch(timeFilter) {
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        cutoffTime = todayStart.getTime();
        break;
      case 'week':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return allRuns;
    }
    
    return allRuns.filter(run => run.timestamp >= cutoffTime);
  }, [allRuns, timeFilter]);
  
  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).toLowerCase();
  };
  
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const runDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (runDate.getTime() === today.getTime()) {
      return 'Today';
    } else if (runDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };
  
  const getTimeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return formatDate(timestamp);
  };
  
  const getShortcutRunCount = (shortcutId) => {
    const shortcut = allShortcuts.find(s => s.id === shortcutId);
    return shortcut ? shortcut.metadata.runCount : 0;
  };
  
  const getMostUsedShortcut = () => {
    if (allShortcuts.length === 0) return null;
    return allShortcuts.reduce((max, shortcut) => 
      shortcut.metadata.runCount > max.metadata.runCount ? shortcut : max
    );
  };
  
  const mostUsedShortcut = getMostUsedShortcut();
  
  const renderRunItem = ({ item, index }) => {
    const showDate = index === 0 || 
      formatDate(item.timestamp) !== formatDate(filteredRuns[index - 1]?.timestamp);
    
    return (
      <View>
        {showDate && (
          <View style={[styles.dateHeader, { backgroundColor: theme.bgPrimary }]}>
            <Text style={[styles.dateHeaderText, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontMedium 
            }]}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[styles.runItem, { backgroundColor: theme.bgCard }]}
          onPress={() => navigation.navigate('ShortcutDetail', { shortcutId: item.shortcutId })}
        >
          <View style={[styles.runIcon, { backgroundColor: item.color + '20' }]}>
            <Ionicons 
              name={item.icon || 'cube'} 
              size={20} 
              color={item.color || theme.primary} 
            />
          </View>
          
          <View style={styles.runContent}>
            <View style={styles.runHeader}>
              <Text style={[styles.runName, { 
                color: theme.textPrimary, 
                fontFamily: theme.fontMedium 
              }]}>
                {item.shortcutName}
              </Text>
              <Text style={[styles.runTime, { 
                color: theme.textMuted, 
                fontFamily: theme.fontRegular 
              }]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
            
            <View style={styles.runFooter}>
              <View style={styles.runTags}>
                <View style={[styles.runTag, { backgroundColor: theme.bgTertiary }]}>
                  <Ionicons name="list" size={12} color={theme.textMuted} />
                  <Text style={[styles.runTagText, { 
                    color: theme.textMuted, 
                    fontFamily: theme.fontRegular 
                  }]}>
                    {item.actions} action{item.actions !== 1 ? 's' : ''}
                  </Text>
                </View>
                
                {item.category && (
                  <View style={[styles.runTag, { backgroundColor: theme.bgTertiary }]}>
                    <Ionicons name="pricetag" size={12} color={theme.textMuted} />
                    <Text style={[styles.runTagText, { 
                      color: theme.textMuted, 
                      fontFamily: theme.fontRegular 
                    }]}>
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.runStats}>
                <Ionicons name="play" size={14} color={theme.textMuted} />
                <Text style={[styles.runCount, { 
                  color: theme.textMuted, 
                  fontFamily: theme.fontRegular 
                }]}>
                  {getShortcutRunCount(item.shortcutId)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  const TimeFilterButton = ({ filter, label }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        { 
          backgroundColor: timeFilter === filter ? theme.primary : 'transparent',
          borderColor: timeFilter === filter ? theme.primary : theme.borderPrimary
        }
      ]}
      onPress={() => setTimeFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        { 
          color: timeFilter === filter ? '#fff' : theme.textPrimary,
          fontFamily: theme.fontMedium
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.bgPrimary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { 
            color: theme.textPrimary, 
            fontFamily: theme.fontBold 
          }]}>
            History
          </Text>
          
          <View style={{ width: 40 }} />
        </View>
        
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.primary, 
              fontFamily: theme.fontBold 
            }]}>
              {stats.totalRuns}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              Total Runs
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.green, 
              fontFamily: theme.fontBold 
            }]}>
              {stats.runsToday}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              Today
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { 
              color: theme.orange, 
              fontFamily: theme.fontBold 
            }]}>
              {stats.activeShortcuts}
            </Text>
            <Text style={[styles.statLabel, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              Active
            </Text>
          </View>
        </View>
        
        {/* Most Used Shortcut */}
        {mostUsedShortcut && mostUsedShortcut.metadata.runCount > 0 && (
          <TouchableOpacity
            style={[styles.mostUsedCard, { backgroundColor: theme.bgCard }]}
            onPress={() => navigation.navigate('ShortcutDetail', { shortcutId: mostUsedShortcut.id })}
          >
            <View style={styles.mostUsedContent}>
              <View style={[styles.mostUsedIcon, { backgroundColor: mostUsedShortcut.color + '20' }]}>
                <Ionicons 
                  name={mostUsedShortcut.icon || 'cube'} 
                  size={20} 
                  color={mostUsedShortcut.color} 
                />
              </View>
              
              <View style={styles.mostUsedInfo}>
                <Text style={[styles.mostUsedLabel, { 
                  color: theme.textMuted, 
                  fontFamily: theme.fontMedium 
                }]}>
                  Most Used
                </Text>
                <Text style={[styles.mostUsedName, { 
                  color: theme.textPrimary, 
                  fontFamily: theme.fontMedium 
                }]}>
                  {mostUsedShortcut.name}
                </Text>
              </View>
              
              <View style={styles.mostUsedStats}>
                <View style={[styles.mostUsedBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Ionicons name="play" size={12} color={theme.primary} />
                  <Text style={[styles.mostUsedCount, { 
                    color: theme.primary, 
                    fontFamily: theme.fontMedium 
                  }]}>
                    {mostUsedShortcut.metadata.runCount}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        
        {/* Time Filters - Horizontal Scroll */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContent}
        >
          <TimeFilterButton filter="all" label="All Time" />
          <TimeFilterButton filter="today" label="Today" />
          <TimeFilterButton filter="week" label="This Week" />
          <TimeFilterButton filter="month" label="This Month" />
        </ScrollView>
      </View>
      
      <FlatList
        data={filteredRuns}
        keyExtractor={(item) => item.shortcutId + '-' + item.timestamp}
        renderItem={renderRunItem}
        style={styles.historyList}
        contentContainerStyle={styles.historyContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.bgTertiary }]}>
              <Ionicons name="time-outline" size={48} color={theme.textMuted} />
            </View>
            
            <Text style={[styles.emptyTitle, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontBold 
            }]}>
              No History Yet
            </Text>
            
            <Text style={[styles.emptySubtitle, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              {timeFilter !== 'all' 
                ? `No shortcut runs in the ${timeFilter}`
                : 'Run some shortcuts to see their history here'}
            </Text>
            
            <TouchableOpacity
              style={[styles.emptyButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('CreateShortcut')}
            >
              <Ionicons name="play" size={18} color="#fff" />
              <Text style={[styles.emptyButtonText, { fontFamily: theme.fontMedium }]}>
                Run a Shortcut
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  mostUsedCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mostUsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mostUsedIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mostUsedInfo: {
    flex: 1,
  },
  mostUsedLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  mostUsedName: {
    fontSize: 16,
  },
  mostUsedStats: {
    marginLeft: 'auto',
  },
  mostUsedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  mostUsedCount: {
    fontSize: 14,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filtersContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 14,
  },
  historyList: {
    flex: 1,
  },
  historyContent: {
    paddingBottom: 100,
  },
  dateHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  dateHeaderText: {
    fontSize: 15,
    opacity: 0.8,
  },
  runItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  runIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  runContent: {
    flex: 1,
  },
  runHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  runName: {
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  runTime: {
    fontSize: 13,
  },
  runFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  runTags: {
    flexDirection: 'row',
    gap: 8,
  },
  runTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  runTagText: {
    fontSize: 11,
  },
  runStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  runCount: {
    fontSize: 13,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.7,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});