// Generate consistent colors for categories based on their ID or name
// Each color combination ensures high contrast between background, text, and hover colors
const categoryColors = [
  { bg: '#E3F2FD', text: '#0D47A1', hover: '#1976D2', hoverText: '#FFFFFF' }, // Light Blue / Dark Blue / Medium Blue / White
  { bg: '#F3E5F5', text: '#4A148C', hover: '#7B1FA2', hoverText: '#FFFFFF' }, // Light Purple / Dark Purple / Medium Purple / White
  { bg: '#E8F5E8', text: '#1B5E20', hover: '#388E3C', hoverText: '#FFFFFF' }, // Light Green / Dark Green / Medium Green / White
  { bg: '#FFF3E0', text: '#E65100', hover: '#FF9800', hoverText: '#FFFFFF' }, // Light Orange / Dark Orange / Medium Orange / White
  { bg: '#FCE4EC', text: '#880E4F', hover: '#E91E63', hoverText: '#FFFFFF' }, // Light Pink / Dark Pink / Medium Pink / White
  { bg: '#F1F8E9', text: '#33691E', hover: '#689F38', hoverText: '#FFFFFF' }, // Light Lime / Dark Lime / Medium Lime / White
  { bg: '#E0F2F1', text: '#004D40', hover: '#00695C', hoverText: '#FFFFFF' }, // Light Teal / Dark Teal / Medium Teal / White
  { bg: '#FFF8E1', text: '#F57F17', hover: '#FFC107', hoverText: '#000000' }, // Light Yellow / Dark Yellow / Medium Yellow / Black
  { bg: '#EFEBE9', text: '#3E2723', hover: '#795548', hoverText: '#FFFFFF' }, // Light Brown / Dark Brown / Medium Brown / White
  { bg: '#F9FBE7', text: '#1B5E20', hover: '#8BC34A', hoverText: '#FFFFFF' }, // Light Lime Green / Dark Green / Medium Lime Green / White
  { bg: '#E8EAF6', text: '#1A237E', hover: '#3F51B5', hoverText: '#FFFFFF' }, // Light Indigo / Dark Indigo / Medium Indigo / White
  { bg: '#FFEBEE', text: '#B71C1C', hover: '#F44336', hoverText: '#FFFFFF' }, // Light Red / Dark Red / Medium Red / White
  { bg: '#E1F5FE', text: '#01579B', hover: '#03A9F4', hoverText: '#FFFFFF' }, // Light Cyan / Dark Cyan / Medium Cyan / White
  { bg: '#FFF2E5', text: '#FF6F00', hover: '#FF9800', hoverText: '#FFFFFF' }, // Light Peach / Dark Orange / Medium Orange / White
  { bg: '#F8E8FF', text: '#6A1B9A', hover: '#9C27B0', hoverText: '#FFFFFF' }, // Light Lavender / Dark Purple / Medium Purple / White
  { bg: '#E8F6E8', text: '#2E7D32', hover: '#4CAF50', hoverText: '#FFFFFF' }, // Light Mint / Dark Green / Medium Green / White
  { bg: '#FFF0F5', text: '#C2185B', hover: '#E91E63', hoverText: '#FFFFFF' }, // Light Rose / Dark Pink / Medium Pink / White
  { bg: '#E0F7FA', text: '#00838F', hover: '#00BCD4', hoverText: '#FFFFFF' }, // Light Aqua / Dark Cyan / Medium Cyan / White
];

// Function to generate a random color with good contrast for all states
const generateRandomColor = (seed) => {
  // Use seed to generate consistent random colors for each category
  const random = (seed * 9301 + 49297) % 233280;
  const hue = (random / 233280) * 360;
  
  // Generate light background
  const bgSaturation = 20 + (random % 30); // 20-50% saturation
  const bgLightness = 85 + (random % 10); // 85-95% lightness
  const bg = `hsl(${hue}, ${bgSaturation}%, ${bgLightness}%)`;
  
  // Generate contrasting dark text
  const textSaturation = 70 + (random % 30); // 70-100% saturation  
  const textLightness = 15 + (random % 25); // 15-40% lightness
  const text = `hsl(${hue}, ${textSaturation}%, ${textLightness}%)`;
  
  // Generate medium hover background (between light bg and dark text)
  const hoverSaturation = 50 + (random % 30); // 50-80% saturation
  const hoverLightness = 45 + (random % 15); // 45-60% lightness
  const hover = `hsl(${hue}, ${hoverSaturation}%, ${hoverLightness}%)`;
  
  // Hover text should be white or black for best contrast
  const hoverText = hoverLightness < 50 ? '#FFFFFF' : '#000000';
  
  return { bg, text, hover, hoverText };
};

export const getCategoryColor = (categoryId) => {
  if (!categoryId) return categoryColors[0];
  
  // First try predefined colors
  const predefinedIndex = categoryId % categoryColors.length;
  if (predefinedIndex < categoryColors.length) {
    return categoryColors[predefinedIndex];
  }
  
  // For categories beyond predefined colors, generate random ones
  return generateRandomColor(categoryId);
};

export default getCategoryColor;