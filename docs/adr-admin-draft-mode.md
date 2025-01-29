# ADR: Admin Draft Mode Implementation

## Context
We need to implement an "Admin" mode that allows designated users to submit draft picks on behalf of other users. This is necessary for scenarios where the drafting user doesn't have access to a computer during their turn.

## Decision
We will implement an Admin Draft Mode with the following key components:

1. **Admin User Role**
   - Add an `isAdmin` boolean flag to the user model
   - Initially limit this to 2 designated admin users
   - Admin status will be managed through backend configuration

2. **Draft-As-User Feature**
   - Add a user selection dropdown for admins in the draft interface
   - When an admin is drafting, they must explicitly select which user they are drafting for
   - The draft submission will be attributed to the selected user, not the admin

3. **Security Measures**
   - Admin status must be verified on both frontend and backend
   - All draft-as-user actions will be logged for audit purposes
   - Backend validation will ensure:
     - The acting user has admin privileges
     - The target user is currently allowed to draft
     - The draft submission follows all normal draft rules

4. **User Interface Changes**
   - Add an admin mode indicator in the UI when acting as admin
   - Provide clear visual feedback about which user is being drafted for
   - Include confirmation steps to prevent accidental submissions

## Technical Implementation

### Frontend Changes

1. Extend Auth Context:
```typescript
// src/features/auth/AuthContext.tsx
interface ExtendedAuthState extends AuthState {
  isAdmin: boolean;
}

// Hook to access admin status
const useIsAdmin = () => {
  const auth = useAuth();
  return auth.user?.profile.groups?.includes('deadpool-admin') || false;
};
```

2. Modify Draft Interface:
```typescript
// src/api/types.ts
export interface DraftRequest {
  name: string;
  player_id: string;
  drafted_by_id?: string; // ID of admin making the draft
}

// src/features/draft/DraftPage.tsx
interface AdminDraftState {
  isAdminDrafting: boolean;
  selectedUserId: string | null;
}
```

3. Add Admin Draft UI Components:
```typescript
// src/features/draft/AdminDraftControls.tsx
const AdminDraftControls = ({
  onUserSelect,
  selectedUserId,
  availableUsers
}: AdminDraftControlsProps) => {
  return (
    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="text-sm font-medium text-yellow-900">Admin Draft Mode</h3>
      <select
        value={selectedUserId || ''}
        onChange={(e) => onUserSelect(e.target.value)}
        className="mt-2 block w-full rounded-md border-gray-300"
      >
        <option value="">Select user to draft for...</option>
        {availableUsers.map(user => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### Backend Changes

1. Extend User Model:
```sql
ALTER TABLE players
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
```

2. Add Admin Middleware:
```typescript
// Backend middleware (pseudo-code)
const verifyAdmin = async (req, res, next) => {
  const user = req.user;
  if (!user.groups.includes('deadpool-admin')) {
    return res.status(403).json({
      message: 'Admin access required'
    });
  }
  next();
};
```

3. Modify Draft Endpoint:
```typescript
// Backend API (pseudo-code)
router.post('/draft', async (req, res) => {
  const { name, player_id, drafted_by_id } = req.body;
  
  // If drafted_by_id is present, verify admin status
  if (drafted_by_id) {
    const admin = await getUser(drafted_by_id);
    if (!admin.is_admin) {
      return res.status(403).json({
        message: 'Only admins can draft for other users'
      });
    }
  }

  // Add to audit log
  await auditLog.create({
    action: 'DRAFT',
    target_user_id: player_id,
    admin_user_id: drafted_by_id,
    details: {
      celebrity_name: name,
      timestamp: new Date()
    }
  });

  // Proceed with draft
  // ...
});
```

4. Add Audit Logging:
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  admin_user_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Consequences

### Positive
- Enables flexible draft management when users are unavailable
- Maintains draft flow even when users can't access computers
- Provides clear accountability through audit logging

### Negative
- Increases system complexity
- Requires careful security implementation
- Needs clear communication about admin capabilities

### Risks
- Potential for admin user mistakes when drafting for others
- Need for clear policies about when admin drafting is appropriate
- Must ensure proper security to prevent abuse

## Alternatives Considered

1. **Delegation System**
   - Allow users to temporarily delegate their draft rights
   - Rejected due to additional complexity and time constraints

2. **Time Extension**
   - Simply extend draft time when users can't access computer
   - Rejected as it would slow down the overall draft process

## Implementation Plan

1. Phase 1: Core Admin Infrastructure (Week 1)
   - Add admin flag to player table
   - Configure OpenID Connect groups for admin role
   - Implement admin verification middleware
   - Set up audit logging table and infrastructure
   - Add isAdmin check to auth context

2. Phase 2: Draft-As-User Feature (Week 2)
   - Create AdminDraftControls component
   - Modify DraftPage to support admin drafting
   - Update draft API endpoint to handle admin submissions
   - Implement admin user selection dropdown
   - Add confirmation modal for admin draft actions

3. Phase 3: Monitoring and Security (Week 3)
   - Implement comprehensive audit logging
   - Add admin action dashboard in UI
   - Set up monitoring alerts for admin actions
   - Add rate limiting for admin actions
   - Create admin activity reports

## Migration Strategy

1. Database Updates:
```sql
-- Create audit logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  target_user_id VARCHAR(255) NOT NULL,
  admin_user_id VARCHAR(255),
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add admin flag to players
ALTER TABLE players
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create index for audit queries
CREATE INDEX idx_audit_logs_admin_user ON audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_target_user ON audit_logs(target_user_id);
```

2. Initial Admin Setup:
```sql
-- Set initial admin users (replace with actual user IDs)
UPDATE players
SET is_admin = TRUE
WHERE id IN ('admin-user-1-id', 'admin-user-2-id');
```

3. Feature Flag Implementation:
```typescript
// src/config/features.ts
export const FEATURES = {
  ADMIN_DRAFT: process.env.ENABLE_ADMIN_DRAFT === 'true'
};

// Usage in components
import { FEATURES } from '../config/features';

const AdminDraftControls = () => {
  if (!FEATURES.ADMIN_DRAFT) return null;
  // ... rest of component
};
```

## Rollout Plan

1. Pre-deployment
   - Update OpenID Connect configuration
   - Add admin users to appropriate groups
   - Deploy database migrations
   - Enable feature flag in staging

2. Deployment Steps
   - Deploy backend changes with admin endpoints disabled
   - Deploy frontend changes behind feature flag
   - Enable admin endpoints with rate limiting
   - Enable feature flag for specific admin users
   - Monitor audit logs and performance

3. Post-deployment
   - Monitor admin action patterns
   - Collect feedback from admin users
   - Review audit logs for anomalies
   - Adjust rate limits based on usage
   - Document admin procedures

## Monitoring and Alerts

1. Security Monitoring
   - Alert on multiple failed admin actions
   - Monitor rate limit violations
   - Track unusual drafting patterns
   - Log all admin session activities

2. Performance Monitoring
   - Track admin action response times
   - Monitor database performance
   - Watch for increased error rates
   - Track feature flag status

3. Audit Reports
   - Daily summary of admin actions
   - Weekly admin usage patterns
   - Monthly security review
   - Quarterly access review