[![npm][npm-image]](npm-url)
[![CI](https://github.com/big-kahuna-burger/acme-01-dns-azure/actions/workflows/ci.yml/badge.svg)](https://github.com/big-kahuna-burger/acme-01-dns-azure/actions/workflows/ci.yml)

# acme-01-dns-azure

Greenlock/Acme.js plugin for Azure DNS

## Installation

1. Add a package to your dependencies
```sh
npm i acme-01-dns-azure
```

2. Then use it in your project with greenlock:
```js
greenlock
  .manager
  .defaults({
    agreeToTerms: true,
    subscriberEmail: 'email_of_person_responsible_for_cert_renewals@yourcompany.com',
    challenges: {
      'dns-01': {
        module: 'acme-dns-01-azure',
        clientId: process.env.AZURE_CLIENT_ID, // Your service principal application id
        clientSecret: process.env.AZURE_CLIENT_SECRET, // Your service principal application secret
        subscriptionId: process.env.AZURE_SUBSCRIPTION_ID, // Your tenant's subscription id,
        azureDomain: process.env.AZURE_DOMAIN, // Your customized tenant domain (or tenant id if your tenant is not customized)
        TTL: 60
      }
    }
  })
```



[npm-url]: https://www.npmjs.com/package/acme-dns-01-azure
[npm-image]: https://img.shields.io/npm/v/acme-dns-01-azure.svg?style=flat-square
