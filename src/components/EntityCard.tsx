import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import SvgIcon, { IconName } from "./SvgIcon";
import Avatar from "./Avatar";
import { colors } from "../themes/colors";

export interface EntityCardData {
  id: string;
  imageUri?: string;
  createdAt: string;
  [key: string]: any; // Allow additional properties
}

export interface EntityCardAction {
  icon: IconName;
  onPress: () => void;
}

export interface EntityCardProps {
  data: EntityCardData;
  title: string;
  subtitle?: string;
  details?: string[];
  fallbackIcon: IconName;
  actions: EntityCardAction[];
  avatarSize?: number;
}

const EntityCard: React.FC<EntityCardProps> = ({
  data,
  title,
  subtitle,
  details = [],
  fallbackIcon,
  actions,
  avatarSize = 60,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Avatar
          imageUri={data.imageUri}
          fallbackIcon={fallbackIcon}
          size={avatarSize}
        />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {details.length > 0 && (
          <View style={styles.detailsContainer}>
            {details.map((detail, index) => (
              <Text key={index} style={styles.detail}>
                {detail}
              </Text>
            ))}
          </View>
        )}
        <Text style={styles.date}>Added: {formatDate(data.createdAt)}</Text>
      </View>
      <View style={styles.actionsContainer}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={action.onPress}
          >
            <SvgIcon name={action.icon} size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.textDark,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "500",
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detail: {
    fontSize: 12,
    color: colors.textMedium,
    marginBottom: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textLight,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
});

export default EntityCard;
