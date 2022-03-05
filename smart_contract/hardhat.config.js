//https://eth-ropsten.alchemyapi.io/v2/SX2T6_LmZnEqqWIR_GAkiW0VWPqLDgSI

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: '0.8.0',
  networks: {
    rapsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/SX2T6_LmZnEqqWIR_GAkiW0VWPqLDgSI',
      accounts: ['599dadc7fdd37cf30c99e7aa55fbb63aa816a1daf74369c732858e30ee84d3ee'],
    }
  }
}