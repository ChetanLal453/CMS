import * as FaIcons from 'react-icons/fa';

// Type for all FontAwesome icon names
export type FaIconName = keyof typeof FaIcons;

// Function to get icon by name
export const getFaIcon = (iconName: string) => {
  const IconComponent = FaIcons[iconName as FaIconName];
  
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found, using FaStar as fallback`);
    return FaIcons.FaStar;
  }
  
  return IconComponent;
};

// Export all icons for reference
export const ALL_FA_ICONS = FaIcons;