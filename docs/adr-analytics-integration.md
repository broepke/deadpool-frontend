# Analytics Integration with Mixpanel

## Context

The application needs comprehensive analytics tracking to understand user behavior and improve the user experience. Key requirements include:

- User context capture
- Page view tracking
- Button clicks and form submissions
- Other critical user interactions

## Decision

We will implement Mixpanel analytics with the following architecture:

### 1. Analytics Service Layer

Create a dedicated analytics service that will:

- Initialize Mixpanel with environment-specific configuration
- Provide a clean API for tracking events
- Handle user identification and context
- Implement standardized event naming and properties

```typescript
// src/services/analytics/index.ts
interface AnalyticsService {
  identify(userId: string, userProperties?: Record<string, any>): void;
  trackPageView(path: string, properties?: Record<string, any>): void;
  trackEvent(name: string, properties?: Record<string, any>): void;
}

// Implementation will use Mixpanel
```

### 2. User Context Management

Capture and maintain user context through:

- Integration with existing auth system (OIDC)
- User properties tracking (e.g., user role, preferences)
- Session management

### 3. Automatic Page View Tracking

Implement using React Router integration:

```typescript
// Example implementation
useEffect(() => {
  return navigation.subscribe(({ location }) => {
    analytics.trackPageView(location.pathname);
  });
}, [navigation]);
```

### 4. Event Tracking Utilities

Create React hooks for common tracking patterns:

```typescript
// Example hooks
const useTrackClick = (eventName: string, properties?: Record<string, any>) => {
  return useCallback(() => {
    analytics.trackEvent(eventName, properties);
  }, [eventName, properties]);
};

const useTrackFormSubmit = (formName: string) => {
  return useCallback(
    (data: Record<string, any>) => {
      analytics.trackEvent(`${formName}_submitted`, data);
    },
    [formName]
  );
};
```

### 5. Standard Events to Track

Key events to implement:

- Page Views
  - All route changes
  - Virtual page views for significant state changes
- User Actions
  - Draft picks
  - Leaderboard interactions
  - Profile updates
  - Player selections
- Form Interactions
  - Form submissions
  - Validation errors
- Error Events
  - API errors
  - Client-side errors
  - Authentication failures

### 6. Implementation Steps

1. Install Mixpanel dependency
2. Create analytics service implementation
3. Set up environment variables for Mixpanel configuration
4. Implement user identification integration
5. Add automatic page view tracking
6. Create tracking hooks
7. Integrate tracking into key user flows

## Consequences

### Positive

- Centralized analytics implementation
- Consistent event naming and tracking
- Easy to extend and maintain
- Automatic tracking where possible
- Type-safe analytics calls

### Negative

- Additional dependency
- Small performance impact from tracking calls
- Need to maintain event naming consistency
- Privacy considerations for user data

## Technical Details

### Environment Configuration

Add the following to both `.env.development` and `.env.production`:

```bash
# Analytics Configuration
VITE_MIXPANEL_TOKEN=your_token_here
VITE_ANALYTICS_ENABLED=true
VITE_ANALYTICS_DEBUG=true  # Only in development
```

### Analytics Service Implementation

```typescript
// src/services/analytics/types.ts
export interface AnalyticsUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
}

export interface PageViewProperties {
  path: string;
  title?: string;
  referrer?: string;
  previousPath?: string;
}

// src/services/analytics/config.ts
export const ANALYTICS_CONFIG = {
  token: import.meta.env.VITE_MIXPANEL_TOKEN,
  enabled: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
  debug: import.meta.env.VITE_ANALYTICS_DEBUG === 'true',
  defaultProperties: {
    environment: import.meta.env.VITE_ENV,
    app_version: import.meta.env.VITE_APP_VERSION,
  }
};

// src/services/analytics/constants.ts
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  DRAFT_PICK: 'draft_pick',
  LEADERBOARD_VIEW: 'leaderboard_view',
  PROFILE_UPDATE: 'profile_update',
  PLAYER_SELECT: 'player_select',
  ERROR_OCCURRED: 'error_occurred',
  FORM_SUBMIT: 'form_submit',
  FORM_ERROR: 'form_error'
} as const;

// src/services/analytics/index.ts
export class MixpanelAnalytics implements AnalyticsService {
  private mixpanel: any;
  private config: typeof ANALYTICS_CONFIG;
  private initialized: boolean = false;

  constructor(config: typeof ANALYTICS_CONFIG) {
    this.config = config;
    if (config.enabled) {
      this.initialize();
    }
  }

  private initialize() {
    if (this.initialized) return;
    
    this.mixpanel = mixpanel.init(this.config.token, {
      debug: this.config.debug,
      persistence: 'localStorage'
    });
    
    this.initialized = true;
  }

  identify(userId: string, userProperties?: Partial<AnalyticsUser>) {
    if (!this.initialized) return;
    
    this.mixpanel.identify(userId);
    if (userProperties) {
      this.mixpanel.people.set({
        $email: userProperties.email,
        $name: userProperties.name,
        role: userProperties.role,
        lastUpdated: new Date().toISOString()
      });
    }
  }

  trackPageView(properties: PageViewProperties) {
    if (!this.initialized) return;
    
    this.mixpanel.track(ANALYTICS_EVENTS.PAGE_VIEW, {
      ...this.config.defaultProperties,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }

  trackEvent(name: keyof typeof ANALYTICS_EVENTS, properties?: Record<string, any>) {
    if (!this.initialized) return;
    
    this.mixpanel.track(ANALYTICS_EVENTS[name], {
      ...this.config.defaultProperties,
      ...properties,
      timestamp: new Date().toISOString()
    });
  }
}

// React Context Provider
export const AnalyticsContext = createContext<AnalyticsService | null>(null);

export const AnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const analytics = useMemo(() => new MixpanelAnalytics(ANALYTICS_CONFIG), []);
  const auth = useAuth(); // Using react-oidc-context

  useEffect(() => {
    if (auth.user) {
      analytics.identify(auth.user.sub, {
        email: auth.user.email,
        name: auth.user.name,
        // Add other relevant user properties
      });
    }
  }, [auth.user, analytics]);

  return (
    <AnalyticsContext.Provider value={analytics}>
      {children}
    </AnalyticsContext.Provider>
  );
};
```

### Feature-Specific Implementation

#### Draft Feature
```typescript
// src/features/draft/DraftPage.tsx
const DraftPage = () => {
  const trackEvent = useTrackEvent();
  
  // Track draft pick submission
  const handlePickSubmit = (pick: Pick) => {
    trackEvent(ANALYTICS_EVENTS.DRAFT_PICK, {
      player_id: pick.playerId,
      round: pick.round,
      position: pick.position,
      draft_status: pick.status
    });
  };
};
```

#### Leaderboard Feature
```typescript
// src/features/leaderboard/LeaderboardPage.tsx
const LeaderboardPage = () => {
  const trackEvent = useTrackEvent();
  
  // Track leaderboard filters
  const handleFilterChange = (filters: LeaderboardFilters) => {
    trackEvent(ANALYTICS_EVENTS.LEADERBOARD_VIEW, {
      filters_applied: filters,
      sort_by: filters.sortField,
      sort_direction: filters.sortDirection
    });
  };
};
```

#### Profile Feature
```typescript
// src/features/profile/ProfilePage.tsx
const ProfilePage = () => {
  const trackEvent = useTrackEvent();
  
  // Track profile updates
  const handleProfileUpdate = (profile: UserProfile) => {
    trackEvent(ANALYTICS_EVENTS.PROFILE_UPDATE, {
      updated_fields: Object.keys(profile),
      has_avatar: !!profile.avatarUrl
    });
  };
};
```

#### Error Tracking
```typescript
// src/api/client.ts
const apiClient = axios.create({
  // ... existing config
});

apiClient.interceptors.response.use(
  response => response,
  error => {
    const analytics = getAnalytics(); // Implement singleton access
    
    analytics?.trackEvent(ANALYTICS_EVENTS.ERROR_OCCURRED, {
      error_type: 'api_error',
      error_message: error.message,
      error_code: error.response?.status,
      endpoint: error.config.url
    });
    
    return Promise.reject(error);
  }
);
```

### Testing Considerations

1. Analytics Service Testing:
```typescript
// src/services/analytics/__tests__/analytics.test.ts
describe('MixpanelAnalytics', () => {
  it('should initialize with correct config', () => {
    const analytics = new MixpanelAnalytics({
      token: 'test-token',
      enabled: true,
      debug: true,
      defaultProperties: {
        environment: 'test'
      }
    });
    
    expect(analytics.isInitialized()).toBe(true);
  });

  it('should not track events when disabled', () => {
    const analytics = new MixpanelAnalytics({
      enabled: false,
      // ... other config
    });
    
    const trackSpy = jest.spyOn(analytics, 'trackEvent');
    analytics.trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, {});
    
    expect(trackSpy).not.toHaveBeenCalled();
  });
});
```

2. Integration Testing:
```typescript
// src/features/draft/__tests__/DraftPage.test.tsx
it('should track draft pick submission', async () => {
  const trackEvent = jest.fn();
  const { getByTestId } = render(
    <AnalyticsContext.Provider value={{ trackEvent }}>
      <DraftPage />
    </AnalyticsContext.Provider>
  );
  
  // Simulate draft pick
  await userEvent.click(getByTestId('submit-pick'));
  
  expect(trackEvent).toHaveBeenCalledWith(
    ANALYTICS_EVENTS.DRAFT_PICK,
    expect.objectContaining({
      player_id: expect.any(String)
    })
  );
});
```

### Event Naming Convention

- Use snake_case for event names
- Format: `{feature}_{action}`
- Examples:
  - `page_view`
  - `draft_pick_selected`
  - `leaderboard_filtered`
  - `profile_updated`

### Common Properties

All events should include:

- `userId` (when authenticated)
- `timestamp`
- `environment`
- `page_path`
- Event-specific properties

## Status

Proposed

## References

- [Mixpanel React Documentation](https://developer.mixpanel.com/docs/react)
- [React Router Documentation](https://reactrouter.com/en/main)
- [Testing React Applications](https://testing-library.com/docs/react-testing-library/intro/)
