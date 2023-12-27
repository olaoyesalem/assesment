
import {
   toroABI,
   toroAddress,
   TradingAddress,
   TradingABI
} from '../front-end/constant.js'
import { ethers ,BigNumber} from './ethers-5.6.esm.min.js'

const connectButton = document.getElementById('connectButton')
connectButton.onclick = connect

const createLiqudityButton =document.getElementById('createButton')
createLiqudityButton.onclick= createLiquidity

const removeLiquidityButton = document.getElementById('removeLiquidity')
removeLiquidityButton.onclick = removeLiquidity

const swapUSDButton = document.getElementById('swapUSDButton')
swapUSDButton.onclick = swapUSD

const swapNGNButton = document.getElementById('swapNGNButton')
swapNGNButton.onclick = swapNGN

const getExchangeRateButtonNGN = document.getElementById('getExchangeRateNGNButton')
getExchangeRateButtonNGN.onclick = getExchangeRateNGN

const getExchangeRateUSDButton = document.getElementById('getExchangeRateUSDButton')
getExchangeRateUSDButton.onclick = getExchangeRateUSD

//getExchangeRateUSDButton



let account,userAddress

function listenForTxnMine(txnResponse, provider) {
    // this is to listen to the blockchain and see events that has happened
    console.log(`Mining ${txnResponse.hash} hash`)

    //create a listner for the blockchain
    return new Promise((resolve, reject) => {
        provider.once(txnResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        try {

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
             userAddress = accounts[0];
            console.log(userAddress);
        
           //  const displayAddress = account.slice(0, 5) + '...' + account.slice(-3);
              await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: "0xd431" }]
              });
              
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = userAddress
    
    } else {
        connectButton.innerHTML = 'Install Metamask !!!!'
    }
}

async function createLiquidity() {
    const amountUSD = document.getElementById('amountUSD').value
    const amountNGN=document.getElementById('amountNGN').value
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        try {
            const toroContract = new ethers.Contract(
                toroAddress,
                 toroABI,
                 signer
                )
        
        
                const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
                const parseUSD = ethers.utils.parseEther(amountUSD)
               
                const parseNGN = ethers.utils.parseEther(amountNGN)
              
                const totalAmount = parseNGN.add(parseUSD)
               
                await toroContract.approve(TradingAddress,totalAmount) 
                
               
                await contract.addUSDLiquidity(parseUSD)
                await toroContract.approve(TradingAddress,totalAmount) 
                await contract.addNGNLiquidity(parseNGN)
                await toroContract.approve(TradingAddress,totalAmount) 
                await contract.addLiquidity(parseUSD,parseNGN)
                
                
           
            

                console.log(`-------------------------------------`)
                console.log(`Done........`)
                alert(" Liquidity Added ")
                
                    
            }
            
        catch (error) {
            console.error(error)
        }
    }
    
}


async function removeLiquidity(){
    const amountOfLiquidity=document.getElementById('amountOfLiquidity').value
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const toroContract = new ethers.Contract(
        toroAddress,
         toroABI,
         signer
        )

    

        const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
        await toroContract.approve(TradingAddress,ethers.utils.parseEther(amountOfLiquidity)) 
        
        const txnResponse = await contract.removeLiquidity(amountOfLiquidity);      
        await listenForTxnMine(txnResponse, provider)
        console.log(`-------------------------------------`)
        console.log(`Done........`)
        alert(` ${amountOfLiquidity} amount of Liquidity Removed` )
      
    }

}
//swapUSDButton
async function swapUSD(){
    const amountIn=document.getElementById('amountOfUSD').value
    const amountOut=document.getElementById('amountOfNGN').value
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const toroContract = new ethers.Contract(
        toroAddress,
         toroABI,
         signer
        )
        const parseIn = ethers.utils.parseEther(amountIn)
               
        const parseOut = ethers.utils.parseEther(amountOut)
      
        const totalAmount = parseIn.add(parseOut)
       


        const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
        await toroContract.approve(TradingAddress,totalAmount) 
        
        const txnResponse = await contract.swap(parseIn,parseOut,toroAddress,toroAddress);   
        const getOutputAmount = await contract.getOutputAmount(parseIn,toroAddress,espeeAddress);   
        await listenForTxnMine(txnResponse, provider)
        console.log(`-------------------------------------`)
        console.log(`Done........`)
        alert(` ${amountIn }USD Successfully Swapped to ${(getOutputAmount/100)}NGN `);
      
    }

}
async function swapNGN(){
    const amountIn=document.getElementById('amountOfNGN').value
    const amountOut=document.getElementById('amountOfUSD').value
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()

        const toroContract = new ethers.Contract(
        toroAddress,
         toroABI,
         signer
        )

        const parseIn = ethers.utils.parseEther(amountIn)
               
        const parseOut = ethers.utils.parseEther(amountOut)
      
        const totalAmount = parseIn.add(parseOut)

        const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
        await toroContract.approve(TradingAddress,totalAmount) 
    
        
        const txnResponse = await contract.swap(parseIn,parseOut,toroAddress,toroAddress);      
        const getOutputAmount = await contract.getOutputAmount(parseIn,toroAddress,toroAddress);   
        await listenForTxnMine(txnResponse, provider)
        console.log(`-------------------------------------`)
        console.log(`Done........`)
        alert(` ${parseIn }NGN Successfully Swapped to ${(getOutputAmount/100)}USD `);
      
    }

}


//getExchangeRate


async function getExchangeRateNGN(){
    
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()


        const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
            
        const txnResponse = await contract.getExchangeRateNGN();      
        await listenForTxnMine(txnResponse, provider)
        console.log(`-------------------------------------`)
        console.log(`Done........`)
        alert(` THE EXCHANGE RATE FROM NGN TO USD :${txnResponse}`)
      
    }

}

async function getExchangeRateUSD(){
    
    console.log(`----------------------------------------`)
    if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()


        const contract = new ethers.Contract(TradingAddress,TradingABI,signer)
            
        const txnResponse = await contract.getExchangeRateUSD();      
        await listenForTxnMine(txnResponse, provider)
        console.log(`-------------------------------------`)
        console.log(`Done........`)
        alert(` THE EXCHANGE RATE FROM USD TO NGN :${txnResponse}`)
      
    }

}
