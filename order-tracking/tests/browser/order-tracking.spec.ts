import { expect, test } from '@playwright/test'

const validOrderNumber = 'ORD-1001'
const validEmailAddress = 'alex.river@example.test'
const expectedStatus = 'In transit'
const expectedTimestamp = 'Sep 20, 2026, 2:30 PM UTC'
const genericFailureMessage = 'We could not validate those order details.'

test('AC-001: prevents lookup and associates missing-field feedback', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Find my order' }).click()

  await expect(page.getByText('Enter your order number.')).toBeVisible()
  await expect(page.getByText('Enter your email address.')).toBeVisible()
  await expect(page.getByLabel('Order number')).toHaveAttribute('aria-describedby', 'order-number-error')
  await expect(page.getByLabel('Email address')).toHaveAttribute('aria-describedby', 'email-address-error')
  await expect(page.getByLabel('Order number')).toHaveAttribute('aria-invalid', 'true')
  await expect(page.getByRole('status')).toHaveText('')
})

test('AC-002 and AC-005: normalizes identifiers and renders only approved tracking fields', async ({ page }) => {
  await page.goto('/')

  await page.getByLabel('Order number').fill(`  ${validOrderNumber.toLowerCase()}  `)
  await page.getByLabel('Email address').fill(`  ${validEmailAddress.toUpperCase()}  `)
  await page.getByRole('button', { name: 'Find my order' }).click()

  const result = page.getByRole('region', { name: 'Order ORD-1001' })
  await expect(result).toBeVisible()
  await expect(result).toContainText(expectedStatus)
  await expect(result).toContainText(expectedTimestamp)
  await expect(result).not.toContainText('alex.river@example.test')
})

test('AC-003 and AC-004: uses one generic failure state for all unsuccessful variants', async ({ page }) => {
  const attempts = [
    { orderNumber: 'ORD-9999', emailAddress: 'missing@example.test' },
    { orderNumber: validOrderNumber, emailAddress: 'missing@example.test' },
    { orderNumber: 'ORD-1002', emailAddress: validEmailAddress },
  ]

  for (const attempt of attempts) {
    await page.goto('/')
    await page.getByLabel('Order number').fill(attempt.orderNumber)
    await page.getByLabel('Email address').fill(attempt.emailAddress)
    await page.getByRole('button', { name: 'Find my order' }).click()

    await expect(page.getByRole('status')).toHaveText(genericFailureMessage)
    await expect(page.getByRole('region', { name: /Order/ })).toHaveCount(0)
  }
})

test('AC-006: completes the lookup using keyboard-only interaction', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Order number')).toBeFocused()
  await page.keyboard.type(validOrderNumber)
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Email address')).toBeFocused()
  await page.keyboard.type(validEmailAddress)
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Find my order' })).toBeFocused()
  await page.keyboard.press('Enter')

  await expect(page.getByRole('region', { name: 'Order ORD-1001' })).toBeVisible()
})

test('AC-007: renders a normal local lookup in under one second after submit', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Order number').fill(validOrderNumber)
  await page.getByLabel('Email address').fill(validEmailAddress)

  const start = await page.evaluate(() => performance.now())
  await page.getByRole('button', { name: 'Find my order' }).click()
  await expect(page.getByRole('region', { name: 'Order ORD-1001' })).toBeVisible()
  const end = await page.evaluate(() => performance.now())

  expect(end - start).toBeLessThan(1000)
})