# Canonical Backend Hook Façade

This module provides a unified, provider-agnostic API for all backend operations in KIIAREN. It abstracts away provider-specific implementations (Convex, self-host) and exposes a consistent hook-based interface for React components.

## Architecture

```
Components → @/lib/backend (canonical façade) → Provider Adapter → Backend Implementation
```

## Usage

### Basic Example

```tsx
import { useGetWorkspaces, useCreateWorkspace } from '@/lib/backend';

function WorkspaceList() {
  const { data: workspaces, isLoading } = useGetWorkspaces();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();

  const handleCreate = async () => {
    await createWorkspace(
      { name: 'My Workspace' },
      {
        onSuccess: (id) => console.log('Created:', id),
        onError: (err) => console.error('Failed:', err),
      }
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {workspaces?.map((ws) => (
        <div key={ws.id}>{ws.name}</div>
      ))}
      <button onClick={handleCreate} disabled={isPending}>
        Create Workspace
      </button>
    </div>
  );
}
```

## Available Hooks

### Workspaces

- `useGetWorkspaces()` - Get all workspaces for current user
- `useGetWorkspace(id)` - Get single workspace by ID
- `useCreateWorkspace()` - Create a new workspace
- `useJoinWorkspace()` - Join a workspace (via join code or invite)
- `useUpdateWorkspace()` - Update workspace name
- `useRemoveWorkspace()` - Delete a workspace
- `useRegenerateJoinCode()` - Regenerate workspace join code

### Channels

- `useGetChannels(workspaceId)` - Get all channels in workspace
- `useGetChannel(id)` - Get single channel by ID
- `useCreateChannel()` - Create a new channel
- `useUpdateChannel()` - Update channel name
- `useRemoveChannel()` - Delete a channel

### Messages

- `useGetMessages({ channelId?, conversationId?, parentMessageId? })` - Get messages with pagination
- `useGetMessage(id)` - Get single message by ID
- `useCreateMessage()` - Send a message
- `useUpdateMessage()` - Edit a message
- `useRemoveMessage()` - Delete a message

### Domain Verification

- `useAddDomain()` - Add domain for verification
- `useVerifyDomain()` - Verify domain via DNS
- `useListDomains()` - List all domains for workspace
- `useRemoveDomain()` - Remove a domain
- `useGetVerificationInstructions()` - Get DNS setup instructions
- `useCheckEmailDomain()` - Check if email matches verified domain

### Invite Links

- `useCreateInviteLink()` - Create an invite link
- `useListInviteLinks()` - List all invite links
- `useRevokeInviteLink()` - Revoke an invite link
- `useValidateInviteLink()` - Validate invite before redemption
- `useGetInviteByCode()` - Get invite details by code

## Provider Support

### Convex (Default)

Uses React hooks (`useQuery`, `useMutation`) internally. Fully reactive and optimized.

### Self-Host (Future)

Will use async provider methods with React state management. Same API, different implementation.

## Migration Guide

### Before (Direct Convex)

```tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/../convex/_generated/api';

function MyComponent() {
  const data = useQuery(api.workspaces.get);
  const create = useMutation(api.workspaces.create);
  
  // Direct Convex types, not provider-agnostic
}
```

### After (Canonical Façade)

```tsx
import { useGetWorkspaces, useCreateWorkspace } from '@/lib/backend';

function MyComponent() {
  const { data, isLoading } = useGetWorkspaces();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  
  // Provider-agnostic types, works with any backend
}
```

## Benefits

1. **Provider-agnostic**: Switch between Convex and self-host without code changes
2. **Type-safe**: Full TypeScript support with provider-agnostic types from `@kiiaren/core`
3. **Consistent API**: Same hook pattern across all features
4. **Future-proof**: Easy to add new providers or features
5. **Better DX**: Clear documentation, consistent error handling, loading states

## Implementation Details

### Convex Adapter

For Convex, hooks are bridged via `adapters/convex-adapter.ts` which:
- Wraps `useQuery`/`useMutation` with consistent state management
- Transforms Convex types to provider-agnostic types
- Maintains reactivity and performance

### Self-Host Adapter (Future)

For self-host, hooks will:
- Use `provider.persistence.*` async methods
- Manage React state internally (`useState`, `useEffect`)
- Provide same hook interface as Convex

## Type Safety

All hooks use types from `@kiiaren/core`:
- `Workspace`, `Channel`, `Message`, `Member`, `Doc`, `Board`
- `EntityId` (provider-agnostic ID type)
- `PaginatedResult<T>`, `PaginationParams`

No direct Convex types (`Id<'workspaces'>`) in component code.

## Error Handling

All mutation hooks support:
- `onSuccess` callback
- `onError` callback
- `onSettled` callback (always called)
- Automatic error throwing (can be disabled)

## See Also

- [Provider Abstraction](../provider/README.md) - Backend provider system
- [Core Types](../../../../packages/core/src/providers/types.ts) - Provider interfaces
- [Migration Notes](../../../../docs/setup/migration-notes.md) - Migration guide