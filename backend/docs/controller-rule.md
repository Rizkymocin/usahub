# Controller Authorization Rules

## Business Access Pattern

### ✅ CORRECT Pattern - Use User's Business Relationship

When accessing a business in a controller, **ALWAYS** use the authenticated user's `businesses()` relationship:

```php
public function index(Request $request, string $businessPublicId)
{
    try {
        $user = $request->user();
        
        // Get business through user's businesses (works for both Owner and Admin)
        $business = $user->businesses()->where('businesses.public_id', $businessPublicId)->first();

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found or access denied'
            ], 404);
        }

        // Use $business->id for service calls
        $data = $this->someService->getData($business->id);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => $e->getMessage()
        ], 500);
    }
}
```

### ❌ INCORRECT Patterns

#### Don't use `tenant_id` from user
```php
// ❌ WRONG - Admin users don't have tenant relationship
$tenantId = $request->user()->tenant->id;
$business = $this->businessService->getBusinessByPublicId($businessPublicId, $tenantId);
```

#### Don't use middleware attributes
```php
// ❌ WRONG - Middleware may not set this for all user types
$tenantId = $request->attributes->get('tenant_id');
$business = $this->businessService->getBusinessByPublicId($businessPublicId, $tenantId);
```

#### Don't use BusinessService for authorization
```php
// ❌ WRONG - Adds unnecessary dependency
public function __construct(
    private SomeService $someService,
    private BusinessService $businessService  // Not needed!
) {}
```

## Why This Pattern?

### 1. **Works for All User Types**
- **Owner**: Has `tenant` relationship, but also has `businesses()` relationship via pivot table
- **Admin**: No `tenant` relationship, accesses businesses via `business_user` pivot table
- **Other roles**: All users access businesses through the same pivot table

### 2. **Built-in Authorization**
- If user is not associated with the business, `$user->businesses()->where(...)` returns `null`
- No need for additional authorization checks
- Leverages Eloquent relationships that already exist

### 3. **Simpler Code**
- No need to inject `BusinessService` just for authorization
- No need to handle different `tenant_id` sources
- Direct use of Eloquent relationships

### 4. **Consistent Pattern**
- Same pattern across all controllers
- Easy to understand and maintain
- Follows Laravel conventions

## Implementation Checklist

When creating a new controller that accesses business data:

- [ ] Get user from request: `$user = $request->user()`
- [ ] Use `$user->businesses()` relationship to find business
- [ ] Check if business exists (returns 404 if not found)
- [ ] Use `$business->id` for service layer calls
- [ ] Do NOT inject `BusinessService` for authorization
- [ ] Do NOT rely on `tenant_id` from user or middleware

## Example Controllers Following This Pattern

- `IspVoucherStockController` - All methods (index, store, update, destroy)
- `AccountController` - Fallback pattern for Owner vs Admin

## Related Files

- `app/Models/User.php` - `businesses()` relationship definition
- `database/migrations/*_create_business_user_table.php` - Pivot table structure
