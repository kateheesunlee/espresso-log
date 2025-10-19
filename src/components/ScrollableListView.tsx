import React from 'react';
import { ScrollView, FlatList, Platform, View, StyleSheet } from 'react-native';

const defaultStyles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  scrollContainer: {
    flex: 1,
  },
});

interface ScrollableListViewProps<T> {
  data: T[];
  renderItem: ({ item }: { item: T }) => React.ReactElement;
  keyExtractor: (item: T) => string;
  style?: any;
  contentContainerStyle?: any;
  showsVerticalScrollIndicator?: boolean;
  emptyComponent?: React.ReactElement;
}

const ScrollableListView = <T,>({
  data,
  renderItem,
  keyExtractor,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  emptyComponent,
}: ScrollableListViewProps<T>) => {
  // Show empty component if no data
  if (data.length === 0 && emptyComponent) {
    return emptyComponent;
  }

  if (Platform.OS === 'web') {
    return (
      <ScrollView
        style={[defaultStyles.scrollContainer, style]}
        contentContainerStyle={[
          defaultStyles.listContainer,
          contentContainerStyle,
        ]}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      >
        {data.map(item => (
          <View key={keyExtractor(item)}>{renderItem({ item })}</View>
        ))}
      </ScrollView>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      style={[defaultStyles.scrollContainer, style]}
      contentContainerStyle={[
        defaultStyles.listContainer,
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    />
  );
};

export default ScrollableListView;
