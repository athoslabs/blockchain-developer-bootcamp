const { ethers } = require('hardhat')
const { expect } = require('chai')

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Token', ()=> {

    let token, accounts, deployer, exchange

    beforeEach(async () => {
        const Token = await ethers.getContractFactory('Token')
        token = await Token.deploy('Dapp University', 'DAPP', '1000000')

        accounts = await ethers.getSigners()
        deployer = accounts[0]
        reciever = accounts[1]
        exchange = accounts[2]
    })

    describe('Deployment', () => {
        const name = 'Dapp University'
        const symbol = 'DAPP'
        const decimals = '18'
        const totalSupply = tokens('1000000')

        it('Has correct name', async () => {
            expect(await token.name()).to.equal(name)
        })
    
        it('Has correct symbol', async () => {
            expect(await token.symbol()).to.equal(symbol)
        })
    
        it('Has correct number of decimals', async () => {
            expect(await token.decimals()).to.equal(decimals)
        })
    
        it('Has correct total supply', async () => {
            expect(await token.totalSupply()).to.equal(totalSupply)
        })

        it('assigns total supply to developer', async () => {
            expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
        })
    })

    describe('Sending Tokens', () => {
        let amount, transaction, result

        describe('Success', () => {
            beforeEach(async () => {
                amount = tokens(100)
                transaction = await token.connect(deployer).transfer(reciever.address, amount)
                result = await transaction.wait()
            })
    
            it('Transfers token balances', async () => {
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
                expect(await token.balanceOf(reciever.address)).to.equal(amount)
            })
    
            it('Emits a Transfer event', async () => {
                const eventTransaction = result.events[0]
                expect(eventTransaction.event).to.equal('Transfer')
    
                const args = eventTransaction.args
                expect(args.from).to.equal(deployer.address)
                expect(args.to).to.equal(reciever.address)
                expect(args.value).to.equal(amount)
            })
        })

        describe('Failure', () => {
            it('Rejects insufficient balances', async () => {
                const invalidAmount = tokens(100000000)
                await expect(token.connect(deployer).transfer(reciever.address, invalidAmount)).to.be.reverted
            })

            it('Rejects invalid recipient', async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })

    describe('Approving Tokens', () => {
        let amount, transaction, result

        beforeEach(async () => {
            amount = tokens(100)
            transaction = await token.connect(deployer).approve(exchange.address, amount)
            result = await transaction.wait()
        })
        
        describe('Success', () => {
            it('Allocates an allowance for delegated token spending', async () => {
                expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
            })

            it('Emits an Approval event', async () => {
                const eventTransaction = result.events[0]
                expect(eventTransaction.event).to.equal('Approval')
    
                const args = eventTransaction.args
                expect(args.owner).to.equal(deployer.address)
                expect(args.spender).to.equal(exchange.address)
                expect(args.value).to.equal(amount) 
            })
        })

        describe('Failure', () => {
            it('Rejects invalid spenders', async () => {
                const amount = tokens(100)
                await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
            })
        })
    })
})