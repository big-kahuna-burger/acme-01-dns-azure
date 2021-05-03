const { writeFileSync } = require('fs')
const fileName = './package.json'
const pkg = require(fileName)

pkg.name = process.argv[2]

writeFileSync(fileName, JSON.stringify(pkg, null, 2))
