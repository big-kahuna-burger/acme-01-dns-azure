describe('Suite', () => {
  const tester = require('acme-dns-01-test')
  const ACME_DNS_01_AZURE = require('../..')

  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_SUBSCRIPTION_ID,
    AZURE_DOMAIN
  } = process.env

  if (!AZURE_CLIENT_ID) {
    throw new Error('Missing AZURE_CLIENT_ID')
  }

  if (!AZURE_CLIENT_SECRET) {
    throw new Error('Missing AZURE_CLIENT_SECRET')
  }

  if (!AZURE_SUBSCRIPTION_ID) {
    throw new Error('Missing AZURE_SUBSCRIPTION_ID')
  }

  if (!AZURE_DOMAIN) {
    throw new Error('Missing AZURE_DOMAIN')
  }

  it('should run to success', async () => {
    const challenger = ACME_DNS_01_AZURE.create({
      clientId: AZURE_CLIENT_ID,
      clientSecret: AZURE_CLIENT_SECRET,
      subscriptionId: AZURE_SUBSCRIPTION_ID,
      azureDomain: AZURE_DOMAIN,
      TTL: 60
    })
    const FAIL_ZONE = 'failzone.com'
    await expect(tester.testZone('dns-01', FAIL_ZONE, challenger))
      .rejects
      .toThrow(`Could not find resource group for ${FAIL_ZONE}`)
  }, 30 * 1000)
})
