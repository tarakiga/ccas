#!/usr/bin/env node

/**
 * Verification script to check if mock data is set up correctly
 * Run with: node frontend/lib/mocks/verify-setup.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs')
const path = require('path')

console.log('🔍 Verifying Mock Data Setup...\n')

let allGood = true

// Check 1: Mock data files exist
console.log('📁 Checking mock data files...')
const mockFiles = [
  'shipments.ts',
  'documents.ts',
  'alerts.ts',
  'workflow.ts',
  'metrics.ts',
  'api.ts',
  'index.ts',
]

const mocksDir = path.join(__dirname)
mockFiles.forEach((file) => {
  const filePath = path.join(mocksDir, file)
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - MISSING!`)
    allGood = false
  }
})

// Check 2: .env.local exists and has the flag
console.log('\n⚙️  Checking environment configuration...')
const envPath = path.join(__dirname, '../../.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  if (envContent.includes('NEXT_PUBLIC_USE_MOCK_DATA=true')) {
    console.log('  ✅ NEXT_PUBLIC_USE_MOCK_DATA=true found in .env.local')
  } else if (envContent.includes('NEXT_PUBLIC_USE_MOCK_DATA')) {
    console.log('  ⚠️  NEXT_PUBLIC_USE_MOCK_DATA found but not set to true')
    console.log('     Update .env.local to: NEXT_PUBLIC_USE_MOCK_DATA=true')
    allGood = false
  } else {
    console.log('  ❌ NEXT_PUBLIC_USE_MOCK_DATA not found in .env.local')
    console.log('     Add this line: NEXT_PUBLIC_USE_MOCK_DATA=true')
    allGood = false
  }
} else {
  console.log('  ❌ .env.local file not found')
  console.log('     Create .env.local and add: NEXT_PUBLIC_USE_MOCK_DATA=true')
  allGood = false
}

// Check 3: useShipments hook is updated
console.log('\n🔗 Checking API hooks integration...')
const hooksPath = path.join(__dirname, '../api/hooks/useShipments.ts')
if (fs.existsSync(hooksPath)) {
  const hooksContent = fs.readFileSync(hooksPath, 'utf-8')
  if (hooksContent.includes('MockApiService')) {
    console.log('  ✅ useShipments hook integrated with MockApiService')
  } else {
    console.log('  ❌ useShipments hook not integrated with mock data')
    allGood = false
  }
} else {
  console.log('  ⚠️  useShipments hook file not found')
}

// Check 4: Types directory exists
console.log('\n📝 Checking types...')
const typesPath = path.join(__dirname, '../../types')
if (fs.existsSync(typesPath)) {
  console.log('  ✅ Types directory exists')
  const typeFiles = ['index.ts', 'shipment.ts', 'alert.ts', 'workflow.ts']
  typeFiles.forEach((file) => {
    const filePath = path.join(typesPath, file)
    if (fs.existsSync(filePath)) {
      console.log(`  ✅ ${file}`)
    } else {
      console.log(`  ⚠️  ${file} - not found`)
    }
  })
} else {
  console.log('  ❌ Types directory not found')
  allGood = false
}

// Summary
console.log('\n' + '='.repeat(50))
if (allGood) {
  console.log('✅ All checks passed! Mock data is ready to use.')
  console.log('\n📋 Next steps:')
  console.log('   1. Start dev server: npm run dev')
  console.log('   2. Open browser: http://localhost:3000')
  console.log('   3. Navigate to: /shipments')
  console.log('   4. Check console for: 📦 Using mock data')
  console.log('\n📖 See TESTING_GUIDE.md for detailed testing instructions')
} else {
  console.log('❌ Some checks failed. Please fix the issues above.')
  console.log('\n📖 See SETUP.md for setup instructions')
}
console.log('='.repeat(50) + '\n')
