'use strict'
const debug = require('debug')(require('./package.json').name)

const {
  DnsManagementClient
} = require('@azure/arm-dns')

const { loginWithServicePrincipalSecret } = require('@azure/ms-rest-nodeauth')

const TXT_TYPE = 'TXT'

class Challenge {
  constructor (options = {}) {
    this.subscriptionId = options.subscriptionId
    this.clientId = options.clientId
    this.clientSecret = options.clientSecret
    this.azureDomain = options.azureDomain
    this.resourceGroups = options.resourceGroups
    this.TTL = options.TTL || 3600
  }

  static create (config) {
    return new Challenge({ ...config, ...this.options })
  }

  async init () {
    debug('Initializing...')
    const { clientId, clientSecret, azureDomain, subscriptionId } = this
    this._tokenCredentials = await loginWithServicePrincipalSecret(clientId, clientSecret, azureDomain)
    this._dnsClient = new DnsManagementClient(this._tokenCredentials, subscriptionId)
    debug('Initialization finished!')
    return null
  }

  async zones () {
    if (!this._dnsClient) {
      this._dnsClient = new DnsManagementClient(this._tokenCredentials, this.subscriptionId)
    }
    const useResourceGroups = this.resourceGroups && this.resourceGroups.length
    const _zones = await (useResourceGroups
      ? Promise.all(this.resourceGroups.map(rg => this._dnsClient.zones.listByResourceGroup(rg)))
      : this._dnsClient.zones.list())

    const zones = _zones.map(z => z.name)

    this.__zoneToResourceGroup = _zones.reduce((map, zone) => ({
      ...map,
      [`${zone.name}`]: zone.id.split('/')[4]
    }), {})

    debug({
      mapping: this.__zoneToResourceGroup,
      zones
    })
    return zones
  }

  async set ({
    challenge: {
      dnsZone,
      dnsPrefix,
      keyAuthorizationDigest,
      dnsAuthorization
    }
  }) {
    const resourceGroup = this.__zoneToResourceGroup[dnsZone]
    const thisTXT = keyAuthorizationDigest || dnsAuthorization
    const nextTXTs = [thisTXT]
    try {
      const result = await this._dnsClient.recordSets.get(
        resourceGroup,
        dnsZone,
        dnsPrefix,
        TXT_TYPE
      )
      nextTXTs.push(result.txtRecords[0].value[0])
    } catch (err) {}

    await this._dnsClient.recordSets.createOrUpdate(
      resourceGroup,
      dnsZone,
      dnsPrefix,
      TXT_TYPE, {
        tTL: this.TTL,
        txtRecords: [...new Set(nextTXTs)].map(v => ({ value: [v] }))
      }
    )
    return thisTXT
  }

  async get ({
    challenge: {
      dnsZone,
      dnsPrefix,
      dnsAuthorization
    }
  }) {
    const resourceGroup = this.__zoneToResourceGroup[dnsZone]
    try {
      const result = await this._dnsClient.recordSets.get(
        resourceGroup,
        dnsZone,
        dnsPrefix,
        TXT_TYPE
      )
      const verified = result.txtRecords.find(txt => txt.value.includes(dnsAuthorization))
      if (!verified) return null
      return {
        dnsAuthorization
      }
    } catch (_err) {
      return null
    }
  }

  async remove ({
    challenge: {
      dnsZone,
      dnsPrefix
    }
  }) {
    const resourceGroup = this.__zoneToResourceGroup[dnsZone]
    try {
      await this._dnsClient.recordSets.deleteMethod(
        resourceGroup,
        dnsZone,
        dnsPrefix,
        TXT_TYPE
      )
    } catch (error) {
      debug({
        msg: error.message,
        reason: '404 - already gone'
      })
    }
    return null
  }
}

module.exports = Challenge