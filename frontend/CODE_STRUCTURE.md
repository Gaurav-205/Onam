# Code Structure Documentation

## 📁 Project Structure

```
frontend/src/
├── components/          # Reusable UI components
│   ├── CartIcon.jsx
│   ├── ErrorBoundary.jsx
│   ├── Events.jsx
│   ├── Footer.jsx
│   ├── Hero.jsx
│   ├── Layout.jsx
│   ├── LoadingSpinner.jsx
│   ├── Navbar.jsx
│   ├── Sadya.jsx
│   ├── Shopping.jsx
│   ├── Toast.jsx
│   ├── UnderDevelopment.jsx
│   └── VideoSection.jsx
│
├── constants/          # Shared constants
│   └── headings.js     # HEADINGS constant used across components
│
├── context/            # React Context providers
│   └── CartContext.jsx # Shopping cart state management
│
├── data/               # Static data files
│   ├── events.js       # Events data
│   ├── sadyaDishes.js  # Sadya dishes data
│   └── shoppingItems.js # Shopping items data
│
├── hooks/              # Custom React hooks
│   └── useToast.js     # Toast notification hook
│
├── pages/              # Page components (routes)
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── ComingSoon.jsx
│   ├── Home.jsx
│   └── Shopping.jsx
│
├── utils/              # Utility functions
│   ├── price.js        # Price parsing and formatting
│   └── validation.js   # Form validation functions
│
├── App.jsx             # Main app component with routing
├── main.jsx            # Application entry point
└── index.css           # Global styles
```

## 🎯 Code Organization Principles

### 1. **Separation of Concerns**
- **Components**: UI logic and presentation
- **Data**: Static data separated from components
- **Utils**: Reusable utility functions
- **Context**: Global state management
- **Hooks**: Reusable logic

### 2. **Data Management**
- All static data (products, events, dishes) moved to `/data` directory
- Data files are pure JavaScript modules
- Easy to update without touching component code

### 3. **Utility Functions**
- **Price Utils** (`utils/price.js`):
  - `parsePrice()` - Safely parse price strings
  - `formatPrice()` - Format numbers as price strings
  - `calculateTotalPrice()` - Calculate cart totals

- **Validation Utils** (`utils/validation.js`):
  - `isValidEmail()` - Email validation
  - `isValidPhone()` - Phone number validation
  - `isValidUPI()` - UPI ID validation
  - `isValidPincode()` - Pincode validation
  - `isRequired()` - Required field validation

### 4. **Component Structure**
- Components follow consistent patterns:
  - Imports at top
  - Constants/data (if component-specific)
  - Sub-components (memoized)
  - Main component
  - Export at bottom

### 5. **Naming Conventions**
- **Components**: PascalCase (e.g., `ProductCard.jsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Functions**: camelCase (e.g., `handleAddToCart`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `HEADINGS`)

## 🔄 Data Flow

### Shopping Cart Flow
```
User Action → Component Handler → CartContext → State Update → UI Re-render
```

### Form Validation Flow
```
User Input → Validation Utils → Error State → UI Feedback
```

### Price Calculation Flow
```
Cart Items → Price Utils → Formatted Display
```

## 📝 Best Practices

1. **Memoization**: Use `memo`, `useMemo`, `useCallback` for performance
2. **Error Handling**: Always handle edge cases (missing data, parse errors)
3. **Type Safety**: Use consistent data structures
4. **Reusability**: Extract common logic to utilities
5. **Documentation**: JSDoc comments for utility functions

## 🚀 Adding New Features

### Adding a New Product
1. Add to `data/shoppingItems.js`
2. Component automatically picks it up

### Adding a New Validation Rule
1. Add function to `utils/validation.js`
2. Use in form validation

### Adding a New Utility
1. Create file in `utils/` directory
2. Export functions
3. Import where needed

## 🎨 Styling Structure

- **Tailwind CSS**: Utility-first styling
- **Custom Colors**: Defined in `tailwind.config.js`
- **Global Styles**: `index.css` for custom animations and utilities
- **Component Styles**: Inline Tailwind classes

## 🔧 Configuration Files

- `tailwind.config.js` - Tailwind configuration
- `vite.config.js` - Vite build configuration
- `package.json` - Dependencies and scripts

