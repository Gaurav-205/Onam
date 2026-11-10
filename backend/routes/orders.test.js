import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import express from 'express'

process.env.CHECKOUT_ENABLED = 'true'
process.env.DB_FALLBACK = 'true'
process.env.ADMIN_API_KEY = 'test-admin-key'

let server
let baseUrl

before(async () => {
  const { default: orderRoutes } = await import('./orders.js')
  const app = express()
  app.use(express.json())
  app.use('/api/orders', orderRoutes)
  server = app.listen(0)
  baseUrl = `http://127.0.0.1:${server.address().port}/api/orders`
})

after(() => server.close())

const order = (overrides = {}) => ({
  studentInfo: {
    name: 'Test', studentId: 'S1', email: 'test@example.com', phone: '9999999999',
    course: 'BTech', department: 'CS', year: '1st Year'
  },
  orderItems: [{ id: 'mundu-001', name: 'Mundu', price: 280, quantity: 1, total: 280 }],
  payment: { method: 'upi', verificationStatus: 'verified' },
  totalAmount: 280,
  ...overrides
})

const post = (body) => fetch(baseUrl, {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
})

test('client cannot self-verify payment; UPI order needs no upfront transaction id', async () => {
  const res = await post(order())
  assert.equal(res.status, 201)
  const { order: created } = await res.json()
  assert.equal(created.status, 'pending')
  assert.equal(created.paymentVerificationStatus, 'unverified')
})

test('client-supplied prices must match the catalog', async () => {
  const res = await post(order({
    orderItems: [{ id: 'mundu-001', name: 'Mundu', price: 1, quantity: 1, total: 1 }],
    totalAmount: 1
  }))
  assert.equal(res.status, 400)
})

test('listing and status updates require the admin key', async () => {
  assert.equal((await fetch(`${baseUrl}?status=pending`)).status, 401)
  assert.equal((await fetch(`${baseUrl}?status=pending`, { headers: { 'X-Admin-Key': 'test-admin-key' } })).status, 200)
  const patch = await fetch(`${baseUrl}/${'a'.repeat(24)}/status`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'confirmed' })
  })
  assert.equal(patch.status, 401)
})
