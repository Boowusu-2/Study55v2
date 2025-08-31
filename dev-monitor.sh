#!/bin/bash

echo "🔍 Development Server Monitor for study.ai"
echo "=========================================="

# Check if dev server is running
if pgrep -f "npm run dev" > /dev/null; then
    echo "✅ Development server is running"
else
    echo "❌ Development server is not running"
    exit 1
fi

# Check memory usage
echo ""
echo "📊 Memory Usage:"
free -h | grep -E "Mem|Swap"

# Check disk space
echo ""
echo "💾 Disk Space:"
df -h . | tail -1

# Check for any error logs
echo ""
echo "📝 Recent Error Logs:"
if [ -f ".next/error.log" ]; then
    tail -10 .next/error.log
else
    echo "No error log found"
fi

# Check for any TypeScript errors
echo ""
echo "🔧 TypeScript Status:"
npx tsc --noEmit --skipLibCheck 2>&1 | head -10

# Check for any linting issues
echo ""
echo "🧹 ESLint Status:"
npx eslint src/ --ext .ts,.tsx --max-warnings 0 2>&1 | head -10

echo ""
echo "✅ Monitor complete. Check the output above for any issues."
