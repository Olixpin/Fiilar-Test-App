#!/bin/bash

# Files that need toast declaration added
files=(
  "apps/web/src/features/Bookings/components/ModifyBookingModal.tsx"
  "apps/web/src/features/Bookings/pages/DamageReportView.tsx"
  "apps/web/src/features/Auth/components/EmailVerificationBanner.tsx"
  "apps/web/src/features/UserDashboard/components/WalletCard.tsx"
  "apps/web/src/features/UserDashboard/hooks/useSettingsData.ts"
  "apps/web/src/features/UserDashboard/pages/UserDashboard.tsx"
  "apps/web/src/features/HostDashboard/hooks/useListingActions.ts"
  "apps/web/src/features/HostDashboard/hooks/useListingForm.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if toast declaration already exists
    if ! grep -q "const toast = useToast()" "$file"; then
      echo "Adding toast declaration to: $file"
      
      # Find the component/function declaration and add toast after it
      # This works for both function components and hooks
      sed -i '' '/^export const.*= .*{$/a\
    const toast = useToast();
' "$file" 2>/dev/null || \
      sed -i '' '/^const.*: React\.FC.*= .*{$/a\
    const toast = useToast();
' "$file" 2>/dev/null || \
      sed -i '' '/^export function.*{$/a\
    const toast = useToast();
' "$file" 2>/dev/null || echo "  Could not auto-add to $file - needs manual fix"
    fi
  fi
done

echo "Toast declarations added!"
