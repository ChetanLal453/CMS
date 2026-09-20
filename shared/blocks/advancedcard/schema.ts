import { advancedCardDefaultProps } from './defaults'


export const advancedCardSchema = {
  categories: [
    {
      id: 'variant',
      label: '🧩 Variant',
      expanded: true
    },
    {
      id: 'image-settings',
      label: '📷 Image Settings',
      expanded: true
    },
    {
      id: 'image-hover',
      label: '✨ Image Hover Effects',
      expanded: false
    },
    {
      id: 'icon-settings',
      label: '🎨 Icon Settings',
      expanded: false
    },
    {
      id: 'icon-hover',
      label: '✨ Icon Hover Effects',
      expanded: false
    },
    {
      id: 'title-settings',
      label: '📝 Title Settings',
      expanded: false
    },
    {
      id: 'subtitle-settings',
      label: '📝 Subtitle Settings',
      expanded: false
    },
    {
      id: 'description-settings',
      label: '📝 Description Settings',
      expanded: false
    },
    {
      id: 'global-text',
      label: '🔤 Global Text Settings',
      expanded: false
    },
    {
      id: 'badge-settings',
      label: '🏷️ Badge Settings',
      expanded: false
    },
    {
      id: 'button-settings',
      label: '🔼 Button Settings',
      expanded: false
    },
    {
      id: 'button-hover',
      label: '✨ Button Hover Effects',
      expanded: false
    },
    {
      id: 'card-hover',
      label: '✨ Whole Card Hover Effects',
      expanded: false
    },
    {
      id: 'card-style',
      label: '🎨 Card Style & Layout',
      expanded: false
    },
    {
      id: 'animation',
      label: '🎬 Animation',
      expanded: false
    },
    {
      id: 'flip-feature',
      label: '🔄 Flip Feature',
      expanded: false
    },
    {
      id: 'visibility',
      label: '👁️ Visibility',
      expanded: false
    }
  ],
  properties: {
    // ==================== VARIANT ====================
    variant: {
      type: 'select',
      label: 'Variant',
      default: advancedCardDefaultProps.variant || 'default',
      options: [
        { value: 'default', label: 'Default' },
        { value: 'feature', label: 'Feature' },
        { value: 'blog', label: 'Blog' },
        { value: 'flip', label: 'Flip' },
      ],
      category: 'variant'
    },

    // ==================== IMAGE SETTINGS ====================
    showImage: {
      type: 'toggle',
      label: 'Show Image',
      default: advancedCardDefaultProps.showImage,
      category: 'image-settings',
      description: 'Toggle to show/hide image section'
    },
    image: {
      type: 'image',
      label: 'Card Image',
      default: advancedCardDefaultProps.image,
      category: 'image-settings',
      accept: 'image/*',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    alt: {
      type: 'text',
      label: 'Image Alt Text',
      default: advancedCardDefaultProps.alt,
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    imagePosition: {
      type: 'select',
      label: 'Image Position',
      default: advancedCardDefaultProps.imagePosition,
      options: [
        { value: "top", label: "Top" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
        { value: "background", label: "Background" }
      ],
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    imageHeight: {
      type: 'number',
      label: 'Image Height (px)',
      min: 50,
      max: 1000,
      step: 10,
      default: advancedCardDefaultProps.imageHeight,
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    imageWidth: {
      type: 'number',
      label: 'Image Width (px)',
      min: 50,
      max: 2000,
      step: 10,
      default: advancedCardDefaultProps.imageWidth,
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    objectFit: {
      type: 'select',
      label: 'Object Fit',
      default: advancedCardDefaultProps.objectFit,
      options: [
        { value: 'cover', label: 'Cover' },
        { value: 'contain', label: 'Contain' },
        { value: 'fill', label: 'Fill' },
        { value: 'none', label: 'None' }
      ],
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    overlayColor: {
      type: 'color',
      label: 'Overlay Color',
      default: advancedCardDefaultProps.overlayColor,
      category: 'image-settings',
      dependsOn: ['showImage', 'imagePosition'],
      showIf: (props: any) => props.showImage === true && props.imagePosition === 'background'
    },
    overlayOpacity: {
      type: 'number',
      label: 'Overlay Opacity',
      min: 0,
      max: 1,
      step: 0.1,
      default: advancedCardDefaultProps.overlayOpacity,
      category: 'image-settings',
      dependsOn: ['showImage', 'imagePosition'],
      showIf: (props: any) => props.showImage === true && props.imagePosition === 'background'
    },
    imageShadow: {
      type: 'select',
      label: 'Image Shadow',
      default: advancedCardDefaultProps.imageShadow,
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' }
      ],
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    imageBorderRadius: {
      type: 'number',
      label: 'Image Border Radius (px)',
      min: 0,
      max: 50,
      step: 1,
      default: advancedCardDefaultProps.imageBorderRadius,
      category: 'image-settings',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },

    // ==================== IMAGE HOVER EFFECTS ====================
    imageHoverEffect: {
      type: 'select',
      label: 'Image Hover Effect',
      default: advancedCardDefaultProps.imageHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'zoom', label: 'Zoom In' },
        { value: 'fade', label: 'Fade' },
        { value: 'grayscale', label: 'Grayscale' },
        { value: 'brighten', label: 'Brighten' }
      ],
      category: 'image-hover',
      dependsOn: 'showImage',
      showIf: (props: any) => props.showImage === true
    },
    imageHoverZoom: {
      type: 'number',
      label: 'Zoom Amount',
      min: 1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.imageHoverZoom,
      category: 'image-hover',
      dependsOn: ['showImage', 'imageHoverEffect'],
      showIf: (props: any) => props.showImage === true && props.imageHoverEffect === 'zoom'
    },
    imageHoverBrightness: {
      type: 'number',
      label: 'Brightness Amount',
      min: 1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.imageHoverBrightness,
      category: 'image-hover',
      dependsOn: ['showImage', 'imageHoverEffect'],
      showIf: (props: any) => props.showImage === true && props.imageHoverEffect === 'brighten'
    },
    imageHoverGrayscale: {
      type: 'number',
      label: 'Grayscale Amount (%)',
      min: 0,
      max: 100,
      step: 10,
      default: advancedCardDefaultProps.imageHoverGrayscale,
      category: 'image-hover',
      dependsOn: ['showImage', 'imageHoverEffect'],
      showIf: (props: any) => props.showImage === true && props.imageHoverEffect === 'grayscale'
    },
    imageHoverDuration: {
      type: 'number',
      label: 'Hover Duration (s)',
      min: 0.1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.imageHoverDuration,
      category: 'image-hover',
      dependsOn: ['showImage', 'imageHoverEffect'],
      showIf: (props: any) => props.showImage === true && props.imageHoverEffect !== 'none'
    },

    // ==================== ICON SETTINGS ====================
    showIcon: {
      type: 'toggle',
      label: 'Show Icon',
      default: advancedCardDefaultProps.showIcon,
      category: 'icon-settings',
      description: 'Toggle to show/hide icon section'
    },
    icon: {
      type: 'text',
      label: 'FontAwesome Icon Name',
      default: advancedCardDefaultProps.icon,
      placeholder: 'FaStar, FaReact, FaUser, FaHome...',
      description: 'Enter FontAwesome icon name starting with "Fa"',
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconSize: {
      type: 'number',
      label: 'Icon Size (px)',
      min: 16,
      max: 100,
      step: 2,
      default: advancedCardDefaultProps.iconSize,
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconColor: {
      type: 'color',
      label: 'Icon Color',
      default: advancedCardDefaultProps.iconColor,
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconBackgroundColor: {
      type: 'color',
      label: 'Icon Background Color',
      default: advancedCardDefaultProps.iconBackgroundColor,
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconShape: {
      type: 'select',
      label: 'Icon Shape',
      default: advancedCardDefaultProps.iconShape,
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'square', label: 'Square' },
        { value: 'rounded', label: 'Rounded' }
      ],
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconBorderRadius: {
      type: 'number',
      label: 'Icon Border Radius (px)',
      min: 0,
      max: 50,
      step: 1,
      default: advancedCardDefaultProps.iconBorderRadius,
      category: 'icon-settings',
      dependsOn: ['showIcon', 'iconShape'],
      showIf: (props: any) => props.showIcon === true && props.iconShape === 'rounded'
    },
    iconPadding: {
      type: 'number',
      label: 'Icon Padding (px)',
      min: 0,
      max: 40,
      step: 2,
      default: advancedCardDefaultProps.iconPadding,
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconShadow: {
      type: 'select',
      label: 'Icon Shadow',
      default: advancedCardDefaultProps.iconShadow,
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' }
      ],
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconPosition: {
      type: 'select',
      label: 'Icon Position',
      default: advancedCardDefaultProps.iconPosition,
      options: [
        { value: "top", label: "Top" },
        { value: "left", label: "Left" },
        { value: "right", label: "Right" },
        { value: "background", label: "Background" }
      ],
      category: 'icon-settings',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },

    // ==================== ICON HOVER EFFECTS ====================
    iconHoverEffect: {
      type: 'select',
      label: 'Icon Hover Effect',
      default: advancedCardDefaultProps.iconHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'scale', label: 'Scale' },
        { value: 'color', label: 'Color Change' },
        { value: 'bounce', label: 'Bounce' },
        { value: 'rotate', label: 'Rotate' }
      ],
      category: 'icon-hover',
      dependsOn: 'showIcon',
      showIf: (props: any) => props.showIcon === true
    },
    iconHoverScale: {
      type: 'number',
      label: 'Scale Amount',
      min: 1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.iconHoverScale,
      category: 'icon-hover',
      dependsOn: ['showIcon', 'iconHoverEffect'],
      showIf: (props: any) => props.showIcon === true && props.iconHoverEffect === 'scale'
    },
    iconHoverColor: {
      type: 'color',
      label: 'Icon Hover Color',
      default: advancedCardDefaultProps.iconHoverColor,
      category: 'icon-hover',
      dependsOn: ['showIcon', 'iconHoverEffect'],
      showIf: (props: any) => props.showIcon === true && props.iconHoverEffect === 'color'
    },
    iconBgHoverColor: {
      type: 'color',
      label: 'Icon Background Hover Color',
      default: advancedCardDefaultProps.iconBgHoverColor,
      category: 'icon-hover',
      dependsOn: ['showIcon', 'iconHoverEffect'],
      showIf: (props: any) => props.showIcon === true && props.iconHoverEffect === 'color'
    },
    iconHoverDuration: {
      type: 'number',
      label: 'Hover Duration (s)',
      min: 0.1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.iconHoverDuration,
      category: 'icon-hover',
      dependsOn: ['showIcon', 'iconHoverEffect'],
      showIf: (props: any) => props.showIcon === true && props.iconHoverEffect !== 'none'
    },

    // ==================== TITLE SETTINGS ====================
    showTitle: {
      type: 'toggle',
      label: 'Show Title',
      default: advancedCardDefaultProps.showTitle,
      category: 'title-settings',
      description: 'Toggle to show/hide title'
    },
    title: {
      type: 'text',
      label: 'Title Text',
      default: advancedCardDefaultProps.title,
      category: 'title-settings'
    },
    titleColor: {
      type: 'color',
      label: 'Title Color',
      default: advancedCardDefaultProps.titleColor,
      category: 'title-settings',
      dependsOn: 'showTitle',
      showIf: (props: any) => props.showTitle === true
    },
    titleFontSize: {
      type: 'text',
      label: 'Title Font Size',
      default: advancedCardDefaultProps.titleFontSize,
      category: 'title-settings',
      dependsOn: 'showTitle',
      showIf: (props: any) => props.showTitle === true
    },
    titleFontFamily: {
      type: 'text',
      label: 'Title Font Family',
      default: advancedCardDefaultProps.titleFontFamily,
      category: 'title-settings',
      dependsOn: 'showTitle',
      showIf: (props: any) => props.showTitle === true
    },
    titleAlignment: {
      type: 'select',
      label: 'Title Alignment',
      default: advancedCardDefaultProps.titleAlignment,
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      category: 'title-settings',
      dependsOn: 'showTitle',
      showIf: (props: any) => props.showTitle === true
    },
    titleHoverEffect: {
      type: 'select',
      label: 'Title Hover Effect',
      default: advancedCardDefaultProps.titleHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'color', label: 'Color Change' },
        { value: 'underline', label: 'Underline' },
        { value: 'scale', label: 'Scale' }
      ],
      category: 'title-settings',
      dependsOn: 'showTitle',
      showIf: (props: any) => props.showTitle === true
    },

    // ==================== SUBTITLE SETTINGS ====================
    showSubtitle: {
      type: 'toggle',
      label: 'Show Subtitle',
      default: advancedCardDefaultProps.showSubtitle,
      category: 'subtitle-settings',
      description: 'Toggle to show/hide subtitle'
    },
    subtitle: {
      type: 'text',
      label: 'Subtitle Text',
      default: advancedCardDefaultProps.subtitle,
      category: 'subtitle-settings'
    },
    subtitleColor: {
      type: 'color',
      label: 'Subtitle Color',
      default: advancedCardDefaultProps.subtitleColor,
      category: 'subtitle-settings',
      dependsOn: 'showSubtitle',
      showIf: (props: any) => props.showSubtitle === true
    },
    subtitleFontSize: {
      type: 'text',
      label: 'Subtitle Font Size',
      default: advancedCardDefaultProps.subtitleFontSize,
      category: 'subtitle-settings',
      dependsOn: 'showSubtitle',
      showIf: (props: any) => props.showSubtitle === true
    },
    subtitleAlign: {
      type: 'select',
      label: 'Subtitle Alignment',
      default: advancedCardDefaultProps.subtitleAlign,
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      category: 'subtitle-settings',
      dependsOn: 'showSubtitle',
      showIf: (props: any) => props.showSubtitle === true
    },
    subtitleHoverEffect: {
      type: 'select',
      label: 'Subtitle Hover Effect',
      default: advancedCardDefaultProps.subtitleHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'color', label: 'Color Change' },
        { value: 'italic', label: 'Italic' }
      ],
      category: 'subtitle-settings',
      dependsOn: 'showSubtitle',
      showIf: (props: any) => props.showSubtitle === true
    },

    // ==================== DESCRIPTION SETTINGS ====================
    showDescription: {
      type: 'toggle',
      label: 'Show Description',
      default: advancedCardDefaultProps.showDescription,
      category: 'description-settings',
      description: 'Toggle to show/hide description'
    },
    description: {
      type: 'textarea',
      label: 'Description Text',
      default: advancedCardDefaultProps.description,
      category: 'description-settings'
    },
    descriptionColor: {
      type: 'color',
      label: 'Description Color',
      default: advancedCardDefaultProps.descriptionColor,
      category: 'description-settings',
      dependsOn: 'showDescription',
      showIf: (props: any) => props.showDescription === true
    },
    descriptionFontSize: {
      type: 'text',
      label: 'Description Font Size',
      default: advancedCardDefaultProps.descriptionFontSize,
      category: 'description-settings',
      dependsOn: 'showDescription',
      showIf: (props: any) => props.showDescription === true
    },
    descriptionAlign: {
      type: 'select',
      label: 'Description Alignment',
      default: advancedCardDefaultProps.descriptionAlign,
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      category: 'description-settings',
      dependsOn: 'showDescription',
      showIf: (props: any) => props.showDescription === true
    },
    descriptionHoverEffect: {
      type: 'select',
      label: 'Description Hover Effect',
      default: advancedCardDefaultProps.descriptionHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'color', label: 'Color Change' },
        { value: 'opacity', label: 'Opacity Change' }
      ],
      category: 'description-settings',
      dependsOn: 'showDescription',
      showIf: (props: any) => props.showDescription === true
    },

    // ==================== GLOBAL TEXT SETTINGS ====================
    textAlignment: {
      type: 'select',
      label: 'Global Text Alignment',
      default: advancedCardDefaultProps.textAlignment,
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" }
      ],
      category: 'global-text'
    },
    lineHeight: {
      type: 'text',
      label: 'Line Height',
      default: advancedCardDefaultProps.lineHeight,
      category: 'global-text'
    },
    textSpacing: {
      type: 'text',
      label: 'Text Spacing',
      default: advancedCardDefaultProps.textSpacing,
      category: 'global-text'
    },
    fontFamily: {
      type: 'text',
      label: 'Global Font Family',
      default: advancedCardDefaultProps.fontFamily,
      category: 'global-text'
    },

    // ==================== BADGE SETTINGS ====================
    showBadge: {
      type: 'toggle',
      label: 'Show Badge',
      default: advancedCardDefaultProps.showBadge,
      category: 'badge-settings',
      description: 'Toggle to show/hide badge'
    },
    badgeText: {
      type: 'text',
      label: 'Badge Text',
      default: advancedCardDefaultProps.badgeText,
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },
    badgeColor: {
      type: 'color',
      label: 'Badge Color',
      default: advancedCardDefaultProps.badgeColor,
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },
    badgeTextColor: {
      type: 'color',
      label: 'Badge Text Color',
      default: advancedCardDefaultProps.badgeTextColor,
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },
    badgePosition: {
      type: 'select',
      label: 'Badge Position',
      default: advancedCardDefaultProps.badgePosition,
      options: [
        { value: "top-left", label: "Top Left" },
        { value: "top-right", label: "Top Right" }
      ],
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },
    badgeShape: {
      type: 'select',
      label: 'Badge Shape',
      default: advancedCardDefaultProps.badgeShape,
      options: [
        { value: 'pill', label: 'Pill' },
        { value: 'rounded', label: 'Rounded' },
        { value: 'square', label: 'Square' }
      ],
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },
    badgeHoverEffect: {
      type: 'select',
      label: 'Badge Hover Effect',
      default: advancedCardDefaultProps.badgeHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'scale', label: 'Scale' },
        { value: 'glow', label: 'Glow' }
      ],
      category: 'badge-settings',
      dependsOn: 'showBadge',
      showIf: (props: any) => props.showBadge === true
    },

    // ==================== BUTTON SETTINGS ====================
    showButton: {
      type: 'toggle',
      label: 'Show Button',
      default: advancedCardDefaultProps.showButton,
      category: 'button-settings',
      description: 'Toggle to show/hide button'
    },
    buttonText: {
      type: 'text',
      label: 'Button Text',
      default: advancedCardDefaultProps.buttonText,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonLink: {
      type: 'text',
      label: 'Button Link',
      default: advancedCardDefaultProps.buttonLink,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonStyle: {
      type: 'select',
      label: 'Button Style',
      default: advancedCardDefaultProps.buttonStyle,
      options: [
        { value: "primary", label: "Primary" },
        { value: "secondary", label: "Secondary" },
        { value: "outline", label: "Outline" },
        { value: "ghost", label: "Ghost" },
        { value: "gradient", label: "Gradient" },
        { value: "glass", label: "Glass" },
        { value: "3d", label: "3D Effect" },
        { value: "rounded-full", label: "Pill (Rounded Full)" }
      ],
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonColor: {
      type: 'color',
      label: 'Button Color',
      default: advancedCardDefaultProps.buttonColor,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonTextColor: {
      type: 'color',
      label: 'Button Text Color',
      default: advancedCardDefaultProps.buttonTextColor,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonAlignment: {
      type: 'select',
      label: 'Button Alignment',
      default: advancedCardDefaultProps.buttonAlignment,
      options: [
        { value: "left", label: "Left" },
        { value: "center", label: "Center" },
        { value: "right", label: "Right" },
        { value: "full-width", label: "Full Width" }
      ],
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonIcon: {
      type: 'text',
      label: 'Button Icon',
      default: advancedCardDefaultProps.buttonIcon,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonSize: {
      type: 'select',
      label: 'Button Size',
      default: advancedCardDefaultProps.buttonSize,
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' }
      ],
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonRadius: {
      type: 'number',
      label: 'Button Border Radius (px)',
      min: 0,
      max: 50,
      step: 1,
      default: advancedCardDefaultProps.buttonRadius,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonFullWidth: {
      type: 'toggle',
      label: 'Full Width Button',
      default: advancedCardDefaultProps.buttonFullWidth,
      category: 'button-settings',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },

    // ==================== BUTTON HOVER EFFECTS ====================
    buttonHoverEffect: {
      type: 'select',
      label: 'Button Hover Effect',
      default: advancedCardDefaultProps.buttonHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'scale', label: 'Scale' },
        { value: 'glow', label: 'Glow' },
        { value: 'slide', label: 'Slide' },
        { value: 'bounce', label: 'Bounce' },
        { value: 'shine', label: 'Shine' }
      ],
      category: 'button-hover',
      dependsOn: 'showButton',
      showIf: (props: any) => props.showButton === true
    },
    buttonHoverColor: {
      type: 'color',
      label: 'Button Hover Color',
      default: advancedCardDefaultProps.buttonHoverColor,
      category: 'button-hover',
      dependsOn: ['showButton', 'buttonHoverEffect'],
      showIf: (props: any) => props.showButton === true && props.buttonHoverEffect !== 'none'
    },
    buttonTextHoverColor: {
      type: 'color',
      label: 'Button Text Hover Color',
      default: advancedCardDefaultProps.buttonTextHoverColor,
      category: 'button-hover',
      dependsOn: ['showButton', 'buttonHoverEffect'],
      showIf: (props: any) => props.showButton === true && props.buttonHoverEffect !== 'none'
    },

    // ==================== WHOLE CARD HOVER EFFECTS ====================
    cardHoverEffect: {
      type: 'select',
      label: 'Card Hover Effect',
      default: advancedCardDefaultProps.cardHoverEffect,
      options: [
        { value: 'none', label: 'No Hover Effect' },
        { value: 'shadow', label: 'Shadow' },
        { value: 'scale', label: 'Scale Up' },
        { value: 'lift', label: 'Lift Up' },
        { value: 'glow', label: 'Glow' },
        { value: 'border-glow', label: 'Border Glow' },
        { value: 'tilt', label: '3D Tilt' }
      ],
      category: 'card-hover'
    },
    cardHoverShadow: {
      type: 'select',
      label: 'Hover Shadow',
      default: advancedCardDefaultProps.cardHoverShadow,
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' }
      ],
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'shadow' || props.cardHoverEffect === 'lift'
    },
    cardHoverScale: {
      type: 'number',
      label: 'Scale Amount',
      min: 1,
      max: 1.5,
      step: 0.01,
      default: advancedCardDefaultProps.cardHoverScale,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'scale'
    },
    cardHoverTilt: {
      type: 'number',
      label: 'Tilt Angle (degrees)',
      min: 0,
      max: 20,
      step: 1,
      default: advancedCardDefaultProps.cardHoverTilt,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'tilt'
    },
    cardHoverGlowColor: {
      type: 'color',
      label: 'Glow Color',
      default: advancedCardDefaultProps.cardHoverGlowColor,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'glow' || props.cardHoverEffect === 'border-glow'
    },
    cardHoverGlowIntensity: {
      type: 'number',
      label: 'Glow Intensity',
      min: 0,
      max: 1,
      step: 0.1,
      default: advancedCardDefaultProps.cardHoverGlowIntensity,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'glow' || props.cardHoverEffect === 'border-glow'
    },
    cardHoverGradientFrom: {
      type: 'color',
      label: 'Gradient Start Color',
      default: advancedCardDefaultProps.cardHoverGradientFrom,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'gradient-shift'
    },
    cardHoverGradientTo: {
      type: 'color',
      label: 'Gradient End Color',
      default: advancedCardDefaultProps.cardHoverGradientTo,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect === 'gradient-shift'
    },
    cardHoverDuration: {
      type: 'number',
      label: 'Hover Duration (s)',
      min: 0.1,
      max: 2,
      step: 0.1,
      default: advancedCardDefaultProps.cardHoverDuration,
      category: 'card-hover',
      dependsOn: 'cardHoverEffect',
      showIf: (props: any) => props.cardHoverEffect !== 'none'
    },

    // ==================== CARD STYLE & LAYOUT ====================
    backgroundColor: {
      type: 'color',
      label: 'Background Color',
      default: advancedCardDefaultProps.backgroundColor,
      category: 'card-style'
    },
    borderColor: {
      type: 'color',
      label: 'Border Color',
      default: advancedCardDefaultProps.borderColor,
      category: 'card-style'
    },
    borderWidth: {
      type: 'number',
      label: 'Border Width (px)',
      min: 0,
      max: 10,
      step: 1,
      default: advancedCardDefaultProps.borderWidth,
      category: 'card-style'
    },
    borderRadius: {
      type: 'number',
      label: 'Border Radius (px)',
      min: 0,
      max: 50,
      default: advancedCardDefaultProps.borderRadius,
      category: 'card-style'
    },
    shadow: {
      type: 'select',
      label: 'Card Shadow',
      default: advancedCardDefaultProps.shadow,
      options: [
        { value: 'none', label: 'None' },
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' },
        { value: 'xl', label: 'Extra Large' }
      ],
      category: 'card-style'
    },
    padding: {
      type: 'number',
      label: 'Padding (px)',
      min: 0,
      max: 100,
      default: advancedCardDefaultProps.padding,
      category: 'card-style'
    },
    margin: {
      type: 'text',
      label: 'Margin',
      default: advancedCardDefaultProps.margin,
      category: 'card-style'
    },
    width: {
      type: 'text',
      label: 'Width',
      default: advancedCardDefaultProps.width,
      category: 'card-style'
    },
    height: {
      type: 'text',
      label: 'Height',
      default: advancedCardDefaultProps.height,
      category: 'card-style'
    },

    // ==================== ANIMATION ====================
    animationType: {
      type: 'select',
      label: 'Entrance Animation',
      default: advancedCardDefaultProps.animationType,
      options: [
        { value: "none", label: "None" },
        { value: "fade-in", label: "Fade In" },
        { value: "slide-up", label: "Slide Up" },
        { value: "zoom-in", label: "Zoom In" }
      ],
      category: 'animation'
    },
    animationDelay: {
      type: 'number',
      label: 'Animation Delay (ms)',
      default: advancedCardDefaultProps.animationDelay,
      category: 'animation',
      dependsOn: 'animationType',
      showIf: (props: any) => props.animationType !== 'none'
    },
    hoverAnimation: {
      type: 'select',
      label: 'Hover Animation',
      default: advancedCardDefaultProps.hoverAnimation,
      options: [
        { value: "none", label: "None" },
        { value: "glow", label: "Glow" },
        { value: "pulse", label: "Pulse" },
        { value: "scale", label: "Scale" }
      ],
      category: 'animation'
    },
    transitionDuration: {
      type: 'number',
      label: 'Transition Duration (s)',
      min: 0.1,
      max: 5,
      step: 0.1,
      default: advancedCardDefaultProps.transitionDuration,
      category: 'animation'
    },

    // ==================== FLIP FEATURE ====================
    enableFlip: {
      type: 'toggle',
      label: 'Enable Flip Effect',
      default: advancedCardDefaultProps.enableFlip,
      category: 'flip-feature',
      description: 'Toggle to enable/disable flip feature'
    },
    flipOn: {
      type: 'select',
      label: 'Flip Trigger',
      default: advancedCardDefaultProps.flipOn,
      options: [
        { value: 'hover', label: 'On Hover' },
        { value: 'click', label: 'On Click' }
      ],
      category: 'flip-feature',
      dependsOn: 'enableFlip',
      showIf: (props: any) => props.enableFlip === true
    },
    flipDirection: {
      type: 'select',
      label: 'Flip Direction',
      default: advancedCardDefaultProps.flipDirection,
      options: [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' }
      ],
      category: 'flip-feature',
      dependsOn: 'enableFlip',
      showIf: (props: any) => props.enableFlip === true
    },
    flipDuration: {
      type: 'number',
      label: 'Flip Duration (s)',
      min: 0.1,
      max: 5,
      step: 0.1,
      default: advancedCardDefaultProps.flipDuration,
      category: 'flip-feature',
      dependsOn: 'enableFlip',
      showIf: (props: any) => props.enableFlip === true
    },
    flipPerspective: {
      type: 'number',
      label: '3D Perspective (px)',
      min: 0,
      max: 5000,
      step: 100,
      default: advancedCardDefaultProps.flipPerspective,
      category: 'flip-feature',
      dependsOn: 'enableFlip',
      showIf: (props: any) => props.enableFlip === true
    },

    // ==================== VISIBILITY ====================
    visible: {
      type: 'toggle',
      label: 'Visible',
      default: advancedCardDefaultProps.visible,
      category: 'visibility'
    },
    id: {
      type: 'text',
      label: 'Element ID',
      default: advancedCardDefaultProps.id,
      category: 'visibility'
    },
  },
} as any;

const ADVANCED_CARD_SECTION_DEFINITIONS = [
  { id: 'content', label: 'Content', expanded: true },
  { id: 'layout', label: 'Layout', expanded: false },
  { id: 'style', label: 'Style', expanded: false },
  { id: 'interaction', label: 'Interaction', expanded: false },
  { id: 'animation', label: 'Animation', expanded: false },
  { id: 'flip', label: 'Flip', expanded: false },
  { id: 'advanced', label: 'Advanced', expanded: false },
] as const;

const ADVANCED_CARD_SECTION_FIELD_MAP: Record<string, readonly string[]> = {
  content: [
    'showImage',
    'image',
    'alt',
    'showIcon',
    'icon',
    'showTitle',
    'title',
    'showSubtitle',
    'subtitle',
    'showDescription',
    'description',
    'showBadge',
    'badgeText',
    'showButton',
    'buttonText',
    'buttonLink',
    'buttonIcon',
  ],
  layout: [
    'imagePosition',
    'imageHeight',
    'imageWidth',
    'objectFit',
    'iconPosition',
    'titleAlignment',
    'subtitleAlign',
    'descriptionAlign',
    'textAlignment',
    'buttonAlignment',
    'buttonFullWidth',
    'padding',
    'margin',
    'width',
    'height',
  ],
  style: [
    'overlayColor',
    'overlayOpacity',
    'imageShadow',
    'imageBorderRadius',
    'iconSize',
    'iconColor',
    'iconBackgroundColor',
    'iconShape',
    'iconBorderRadius',
    'iconPadding',
    'iconShadow',
    'titleColor',
    'titleFontSize',
    'titleFontFamily',
    'subtitleColor',
    'subtitleFontSize',
    'descriptionColor',
    'descriptionFontSize',
    'lineHeight',
    'textSpacing',
    'fontFamily',
    'badgeColor',
    'badgeTextColor',
    'badgePosition',
    'badgeShape',
    'buttonStyle',
    'buttonColor',
    'buttonTextColor',
    'buttonSize',
    'buttonRadius',
    'backgroundColor',
    'borderColor',
    'borderWidth',
    'borderRadius',
    'shadow',
  ],
  interaction: [
    'imageHoverEffect',
    'imageHoverZoom',
    'imageHoverBrightness',
    'imageHoverGrayscale',
    'imageHoverDuration',
    'iconHoverEffect',
    'iconHoverScale',
    'iconHoverColor',
    'iconBgHoverColor',
    'iconHoverDuration',
    'titleHoverEffect',
    'subtitleHoverEffect',
    'descriptionHoverEffect',
    'badgeHoverEffect',
    'buttonHoverEffect',
    'buttonHoverColor',
    'buttonTextHoverColor',
    'cardHoverEffect',
    'cardHoverShadow',
    'cardHoverScale',
    'cardHoverTilt',
    'cardHoverGlowColor',
    'cardHoverGlowIntensity',
    'cardHoverGradientFrom',
    'cardHoverGradientTo',
    'cardHoverDuration',
  ],
  animation: [
    'animationType',
    'animationDelay',
    'hoverAnimation',
    'transitionDuration',
  ],
  flip: [
    'enableFlip',
    'flipOn',
    'flipDirection',
    'flipDuration',
    'flipPerspective',
  ],
  advanced: [
    'visible',
    'id',
  ],
}

const advancedCardFieldToSection = Object.entries(ADVANCED_CARD_SECTION_FIELD_MAP).reduce<Record<string, string>>((accumulator, [sectionId, fields]) => {
  fields.forEach((field) => {
    accumulator[field] = sectionId
  })
  return accumulator
}, {})

advancedCardSchema.categories = ADVANCED_CARD_SECTION_DEFINITIONS.map((section) => ({ ...section }))

export interface AdvancedCardSchemaFieldProperty {
  type?: string
  title?: string
  description?: string
  default?: any
  category?: string
  panel?: string
  [key: string]: unknown
}

Object.entries(advancedCardSchema.properties).forEach(([fieldName, config]) => {
  if (!config || typeof config !== 'object') {
    return
  }

  const fieldConfig = config as AdvancedCardSchemaFieldProperty
  fieldConfig.category = advancedCardFieldToSection[fieldName] || 'advanced'
  fieldConfig.panel = 'settings'
})
