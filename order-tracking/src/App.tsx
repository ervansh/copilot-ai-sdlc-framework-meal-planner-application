import { useEffect, useRef, useState, type FormEvent } from 'react'
import { lookupOrder, type LookupOutcome } from './domain/lookup'
import type { OrderCatalogue, TrackingResult } from './domain/catalogue'
import './styles.css'

export interface AppProps {
  catalogue?: OrderCatalogue
}

const formatTimestamp = (timestamp: string): string =>
  new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp)) + ' UTC'

export default function App({ catalogue }: AppProps) {
  const [orderNumber, setOrderNumber] = useState('')
  const [emailAddress, setEmailAddress] = useState('')
  const [outcome, setOutcome] = useState<LookupOutcome | undefined>()
  const orderNumberRef = useRef<HTMLInputElement>(null)
  const emailAddressRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (outcome?.kind !== 'validation-error') return
    if (outcome.errors.orderNumber) orderNumberRef.current?.focus()
    else if (outcome.errors.emailAddress) emailAddressRef.current?.focus()
  }, [outcome])

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setOutcome(undefined)
    setOutcome(lookupOrder({ orderNumber, emailAddress }, catalogue))
  }

  const validation = outcome?.kind === 'validation-error' ? outcome.errors : undefined
  const result: TrackingResult | undefined = outcome?.kind === 'success' ? outcome.result : undefined
  const message = outcome?.kind === 'not-found-or-not-validated' ? outcome.message : undefined

  return (
    <main className="shell">
      <section className="lookup-panel" aria-labelledby="page-title">
        <p className="eyebrow">Order support</p>
        <h1 id="page-title">Track your order</h1>
        <p className="intro">Enter the details from your order confirmation to see the latest delivery status.</p>

        <form className="lookup-form" onSubmit={submit} noValidate>
          <div className="field-group">
            <label htmlFor="order-number">Order number</label>
            <input
              ref={orderNumberRef}
              id="order-number"
              name="orderNumber"
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
              aria-invalid={validation?.orderNumber ? 'true' : undefined}
              aria-describedby={validation?.orderNumber ? 'order-number-error' : undefined}
              autoComplete="off"
            />
            {validation?.orderNumber && <p id="order-number-error" className="field-error">{validation.orderNumber}</p>}
          </div>

          <div className="field-group">
            <label htmlFor="email-address">Email address</label>
            <input
              ref={emailAddressRef}
              id="email-address"
              name="emailAddress"
              type="email"
              value={emailAddress}
              onChange={(event) => setEmailAddress(event.target.value)}
              aria-invalid={validation?.emailAddress ? 'true' : undefined}
              aria-describedby={validation?.emailAddress ? 'email-address-error' : undefined}
              autoComplete="email"
            />
            {validation?.emailAddress && <p id="email-address-error" className="field-error">{validation.emailAddress}</p>}
          </div>

          <button type="submit">Find my order</button>
        </form>

        <div className="feedback" role="status" aria-live="polite" aria-atomic="true">
          {message && <p className="failure">{message}</p>}
          {result && (
            <section className="result" aria-labelledby="result-title">
              <p className="eyebrow">Latest update</p>
              <h2 id="result-title">Order {result.orderNumber}</h2>
              <dl>
                <div><dt>Status</dt><dd>{result.status}</dd></div>
                <div><dt>Last updated</dt><dd>{formatTimestamp(result.lastUpdated)}</dd></div>
              </dl>
            </section>
          )}
        </div>
      </section>
    </main>
  )
}