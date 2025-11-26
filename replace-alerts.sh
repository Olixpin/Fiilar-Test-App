#!/bin/bash

# This script replaces all alert() calls with toast.showToast() calls
# It handles the conversion to the correct API format

# Files to process
files=(
  "apps/web/src/features/HostDashboard/hooks/useListingForm.ts"
  "apps/web/src/features/HostDashboard/hooks/useListingActions.ts"
  "apps/web/src/features/UserDashboard/hooks/useSettingsData.ts"
  "apps/web/src/features/UserDashboard/pages/UserDashboard.tsx"
  "apps/web/src/features/UserDashboard/components/WalletCard.tsx"
  "apps/web/src/features/Bookings/pages/DamageReportView.tsx"
  "apps/web/src/features/Bookings/components/CancellationModal.tsx"
  "apps/web/src/features/Bookings/components/ModifyBookingModal.tsx"
  "apps/web/src/features/Auth/components/KYCUpload.tsx"
  "apps/web/src/features/Auth/components/EmailVerificationBanner.tsx"
)

# Add useToast import if not present
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if useToast is already imported
    if ! grep -q "import.*useToast.*from.*@fiilar/ui" "$file"; then
      # Find the last import line and add useToast import after it
      sed -i '' '/^import/a\
import { useToast } from '\''@fiilar/ui'\'';
' "$file" 2>/dev/null || true
    fi
  fi
done

echo "Import statements added. Now replacing alert() calls..."

# Replace alert calls with toast.showToast
# This handles various alert patterns
find apps/web/src/features -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/alert("\([^"]*\)");/toast.showToast({ message: "\1", type: "info" });/g' \
  -e "s/alert('\([^']*\)');/toast.showToast({ message: '\1', type: 'info' });/g" \
  -e 's/alert(`\([^`]*\)`);/toast.showToast({ message: `\1`, type: "info" });/g' \
  -e 's/alert(\([a-zA-Z][a-zA-Z0-9]*\));/toast.showToast({ message: \1, type: "info" });/g' \
  {} \;

echo "Alert replacement complete!"
