describe('Suite', () => {
  const tester = require('acme-dns-01-test')
  const ACME_DNS_01_AZURE = require('../..')

  const {
    AZURE_CLIENT_ID,
    AZURE_CLIENT_SECRET,
    AZURE_SUBSCRIPTION_ID,
    AZURE_DOMAIN,
    TEST_ZONE
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

  if (!TEST_ZONE) {
    throw new Error('Missing TEST_ZONE')
  }
  const challenger = ACME_DNS_01_AZURE.create({
    clientId: AZURE_CLIENT_ID,
    clientSecret: AZURE_CLIENT_SECRET,
    subscriptionId: AZURE_SUBSCRIPTION_ID,
    azureDomain: AZURE_DOMAIN,
    TTL: 60
  })

  it('should run to success', async () => {
    await expect(tester.testZone('dns-01', TEST_ZONE, challenger))
      .resolves
      .toEqual(undefined)
  }, 180 * 1000)

  it('should not throw on repeated delete', async () => {
    await expect(challenger.remove({ challenge: { dnsZone: TEST_ZONE } }))
      .resolves
      .toEqual(null)
  })

  it('should not verify on dummy challenge', async () => {
    await expect(challenger.get({
      challenge: {
        dnsZone: TEST_ZONE,
        dnsPrefix: 'citest',
        dnsAuthorization: 'dummy'
      }
    }))
      .resolves
      .toEqual(null)
  })

  ;[{ params: undefined, errMsg: 'Missing subscriptionId' },
    { params: { subscriptionId: 'abc' }, errMsg: 'Missing clientId' },
    { params: { subscriptionId: 'abc', clientId: 'abc' }, errMsg: 'Missing clientSecret' },
    { params: { subscriptionId: 'abc', clientId: 'abc', clientSecret: 'abc' }, errMsg: 'Missing azureDomain' }
  ].map(testCase => {
    return it('when ' + testCase.errMsg.toLowerCase(), () => {
      const fn = () => new ACME_DNS_01_AZURE(testCase.params)
      expect(fn).toThrow(testCase.errMsg)
    })
  })
})
