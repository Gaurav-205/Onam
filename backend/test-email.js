/**
 * Email Service Test Script
 * 
 * This script tests the email sending functionality.
 * Run this script to verify that email configuration is correct.
 * 
 * Usage:
 *   node test-email.js [test-email@example.com]
 * 
 * Or set TEST_EMAIL environment variable:
 *   TEST_EMAIL=test@example.com node test-email.js
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000'
const TEST_EMAIL = process.argv[2] || process.env.TEST_EMAIL

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality\n')
  console.log(`API Base URL: ${API_BASE_URL}\n`)

  if (!TEST_EMAIL) {
    console.error('❌ Error: Test email address is required')
    console.log('\nUsage:')
    console.log('  node test-email.js test-email@example.com')
    console.log('  OR')
    console.log('  TEST_EMAIL=test@example.com node test-email.js\n')
    process.exit(1)
  }

  console.log(`📧 Test Email: ${TEST_EMAIL}\n`)

  try {
    // Test 1: Check email diagnostics
    console.log('1️⃣  Checking email diagnostics...')
    const diagnosticsResponse = await fetch(`${API_BASE_URL}/api/email-diagnostics`)
    const diagnostics = await diagnosticsResponse.json()
    
    if (diagnostics.emailConfigured) {
      console.log('   ✅ Email is configured')
      console.log(`   📌 Email Service: ${diagnostics.emailService}`)
      console.log(`   📌 Environment: ${diagnostics.environment}`)
    } else {
      console.log('   ❌ Email is NOT configured')
      console.log('   ⚠️  Please set EMAIL_USER and EMAIL_PASSWORD environment variables')
      process.exit(1)
    }
    console.log()

    // Test 2: Test email connection
    console.log('2️⃣  Testing email connection...')
    const connectionResponse = await fetch(`${API_BASE_URL}/api/test-email`)
    const connection = await connectionResponse.json()
    
    if (connection.success) {
      console.log('   ✅ Email connection verified')
      if (connection.warning) {
        console.log(`   ⚠️  Warning: ${connection.warning}`)
      }
    } else {
      console.log(`   ❌ Connection failed: ${connection.message}`)
      if (connection.code) {
        console.log(`   📌 Error Code: ${connection.code}`)
      }
    }
    console.log()

    // Test 3: Send test email
    console.log(`3️⃣  Sending test email to ${TEST_EMAIL}...`)
    const sendResponse = await fetch(`${API_BASE_URL}/api/test-email-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: TEST_EMAIL }),
    })

    const sendResult = await sendResponse.json()

    if (sendResult.success) {
      console.log('   ✅ Test email sent successfully!')
      console.log(`   📌 Message ID: ${sendResult.messageId}`)
      console.log(`   📌 From: ${sendResult.emailFrom}`)
      console.log(`   📌 To: ${sendResult.emailTo}`)
      console.log('\n   📬 Please check your inbox (and spam folder) for the test email.')
    } else {
      console.log(`   ❌ Failed to send test email: ${sendResult.message}`)
      if (sendResult.code) {
        console.log(`   📌 Error Code: ${sendResult.code}`)
      }
      if (sendResult.details) {
        console.log(`   📌 Details:`, sendResult.details)
      }
      process.exit(1)
    }

    console.log('\n✅ All email tests completed successfully!\n')
  } catch (error) {
    console.error('\n❌ Error running email tests:', error.message)
    if (error.cause) {
      console.error('   Cause:', error.cause)
    }
    console.error('\n⚠️  Make sure:')
    console.error('   1. The backend server is running')
    console.error('   2. API_BASE_URL is correct (default: http://localhost:3000)')
    console.error('   3. Environment variables are set correctly')
    process.exit(1)
  }
}

// Run the tests
testEmailFunctionality()

