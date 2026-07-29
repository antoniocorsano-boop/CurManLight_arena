# CML-633I — Accessibility and Browser Validation

## Accessibility Requirements

### ARIA Requirements
- `aria-current="step"` on current step indicator
- `aria-label` on all interactive elements
- `aria-labelledby` for dialog titles
- Proper focus management on step changes
- Keyboard navigation support (Tab, Enter, Arrow keys)

### Accessibility Features

1. **Screen Reader Support**
   - All interactive elements have descriptive labels
   - Step progress announced to screen readers
   - Warning messages announced automatically
   - Error messages associated with relevant elements

2. **Keyboard Navigation**
   - Tab navigation follows logical order
   - Arrow keys navigate between steps
   - Enter/Space activates primary actions
   - Escape closes dialogs/menus
   - Tab order follows visual flow

3. **Color and Contrast**
   - Minimum 4.5:1 contrast ratio for text
   - No color-only status indicators
   - Error states have both color and text indicators
   - Focus indicators clearly visible

4. **Mobile Optimization**
   - Responsive layout for all screen sizes
   - Touch-friendly target sizes (minimum 48dp)
   - No horizontal scrolling required
   - Mobile-friendly step indicators

## Browser Validation

### Supported Browsers
- Latest versions of Chrome, Firefox, Safari, Edge
- Mobile browsers: Chrome for Android, Safari for iOS
- Latest versions of Playwright-supported browsers

### Validation Checks

1. **Console Errors**: No JavaScript errors during normal operation
2. **Console Warnings**: Non-blocking warnings only (no critical warnings)
3. **Network Requests**: All requests successful (200 status)
4. **Performance**: Page load under 3 seconds on typical connection
5. **Responsive Design**: Layout adapts to mobile viewport (390×844 minimum)
6. **Keyboard Navigation**: All interactive elements accessible via keyboard
7. **Screen Reader**: All interactive elements announced properly

### Browser Validation Process

1. **Initial Load**: Verify page loads without console errors
2. **Navigation**: Test all navigation paths (forward/backward)
3. **Step Progression**: Verify step progression and back navigation
4. **Accessibility**: Run automated accessibility checks
5. **Performance**: Measure load times and resource efficiency
6. **Mobile View**: Test on mobile viewport sizes
7. **Error States**: Simulate errors and verify proper handling

## Browser Compatibility

The guided workflow is designed to work across all modern browsers and meets these compatibility requirements:
- Chrome 110+
- Firefox 110+
- Safari 15.4+
- Edge 110+
- Mobile Chrome 110+
- Mobile Safari 15.4+

All browser tests are run in headless mode using Playwright with real viewport sizes.