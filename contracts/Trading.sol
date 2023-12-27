  // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Trading is Ownable{

    address public toroToken;
    

    uint256 public reserveUSD;
    uint256 public reserveNGN;

    uint256 public totalSupply;
    mapping(address => uint256) public balances;

    uint256 public fee; 

    mapping (address =>uint256) public ownerToFeeAmount;

    event Swap(address indexed trader, uint256 amountIn, uint256 amountOut);
    event AddLiquidity(address indexed provider, uint256 amountUSD, uint256 amountNGN, uint256 liquidity);
    event RemoveLiquidity(address indexed provider, uint256 amountUSD, uint256 amountNGN, uint256 liquidity);

    constructor() {
        toroToken = 0xff0dFAe9c45EeB5cA5d269BE47eea69eab99bf6C;
        
        fee = 100;
    }

    /**
     * 
     * @param amountUSD  the amount of tUSD the user wants to add to the liquiduity
    
     */ 
    

    function addUSDLiquidity(uint256 amountUSD) public returns (uint256)  {
        require(amountUSD > 0  , "Invalid liquidity");

      
            IERC20(toroToken).transferFrom(msg.sender, address(this), amountUSD);
            return  amountUSD;
             reserveUSD += amountUSD;
    }

    function addNGNLiquidity(uint256 amountNGN) public returns (uint256) {
         require(amountNGN > 0  , "Invalid liquidity");
    
            IERC20(toroToken).transferFrom(msg.sender, address(this), amountNGN);
              reserveNGN += amountNGN;

            return amountNGN;

    }

    function addLiquidity(uint256 usd, uint256 ngn) public {
        uint256 amountUSD = addUSDLiquidity(usd);
        uint amountNGN = addNGNLiquidity(ngn);
          
             uint256 liquidity = calculateLiquidity(amountUSD, amountNGN);
        require(liquidity > 0, "Insufficient liquidity");

        totalSupply += liquidity;
        balances[msg.sender] += liquidity;

       

    }
    /**
     * 
     * @param liquidity the amunt of  liquidity to remove from the trading pair by burning liquidity tokens.
     */

    function removeLiquidity(uint256 liquidity) public  {
        require(liquidity > 0 && liquidity <= balances[msg.sender], "Invalid liquidity");

        uint256 amountUSD = (liquidity * reserveUSD) / totalSupply;
        uint256 amountNGN = (liquidity * reserveNGN) / totalSupply;

        require(amountUSD > 0 && amountNGN > 0, "Insufficient liquidity");

        totalSupply -= liquidity;
        balances[msg.sender] -= liquidity;

        IERC20(toroToken).transfer(msg.sender, amountUSD);
        IERC20(toroToken).transfer(msg.sender, amountNGN);

        reserveUSD -= amountUSD;
        reserveNGN -= amountNGN;

        emit RemoveLiquidity(msg.sender, amountUSD, amountNGN, liquidity);
    }

    /**
     * 
     * @param amountIn the amount of the input token they want to swap 
     * @param amountOutMin  the minimum amount of the output token they expect to receive.
     * @param inputToken the token address to swap from
     * @param outputToken the token address to swap to
     */    

    function swap(uint256 amountIn, uint256 amountOutMin, address inputToken, address outputToken)
        public
    {
        require(inputToken == toroToken || inputToken == toroToken, "Invalid input token");
        require(outputToken == toroToken || outputToken == toroToken, "Invalid output token");

        uint256 outputAmount = getOutputAmount(amountIn, inputToken, outputToken);
        require(outputAmount >= amountOutMin, "Slippage too high");

        uint256 feeAmount = (outputAmount * fee) / 10000;
       ownerToFeeAmount[owner()]=feeAmount;
        uint256 finalOutputAmount = outputAmount - feeAmount;
        

        if (inputToken == toroToken) {
        IERC20(toroToken).transferFrom(msg.sender, address(this), amountIn);
        IERC20(toroToken).transfer(msg.sender, finalOutputAmount);
        } else {
            IERC20(toroToken).transferFrom(msg.sender, address(this), amountIn);
            IERC20(toroToken).transfer(msg.sender, finalOutputAmount);
        }

        reserveUSD += (inputToken == toroToken ? amountIn : finalOutputAmount);
        reserveNGN += (inputToken == toroToken ? amountIn : finalOutputAmount);

        emit Swap(msg.sender, amountIn, finalOutputAmount);
    }

    function calculateLiquidity(uint256 amountUSD, uint256 amountNGN) internal view returns (uint256) {
        uint256 liquidityUSD = (amountUSD * totalSupply) / reserveUSD;
        uint256 liquidityNGN = (amountNGN * totalSupply) / reserveNGN;
        return liquidityUSD < liquidityNGN ? liquidityUSD : liquidityNGN;
    }

    function getOutputAmount(uint256 inputAmount, address inputToken, address outputToken)
        public
        view
        returns (uint256)
    {
        require(inputToken == toroToken || inputToken == toroToken, "Invalid input token");
        require(outputToken == toroToken || outputToken == toroToken, "Invalid output token");

        if (inputToken == outputToken) {
            return inputAmount;
        }

        uint256 inputReserve = inputToken == toroToken ? reserveUSD : reserveNGN;
        uint256 outputReserve = inputToken == toroToken ? reserveNGN : reserveUSD;

        return (inputAmount * outputReserve) / inputReserve;
    }

      function getExchangeRateNGN() public view returns (uint256) {
    require(reserveUSD > 0 && reserveNGN > 0, "Insufficient reserves");

    // Calculate the exchange rate
    uint256 exchangeRate = reserveNGN / reserveUSD;

    return exchangeRate;
}

 function getExchangeRateUSD() public view returns (uint256) {
    require(reserveUSD > 0 && reserveNGN > 0, "Insufficient reserves");

    // Calculate the exchange rate
    uint256 exchangeRate = reserveUSD/reserveNGN;

    return exchangeRate;
}

function getBalance() public view returns(uint256){
    return IERC20(toroToken).balanceOf(msg.sender);
}

function withdraw(uint256 amount) public  onlyOwner(){
    if(amount<=ownerToFeeAmount[msg.sender]){
        IERC20(toroToken).transfer(msg.sender,amount);
    }
    else{
        revert();
    }
}
}
