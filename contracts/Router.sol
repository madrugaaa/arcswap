// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

interface IUniswapV2Factory {
    function getPair(address tokenA, address tokenB) external view returns (address pair);
}

contract UniswapV2Router {
    address public immutable factory;

    constructor(address _factory) {
        factory = _factory;
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        require(path.length >= 2, 'UniswapV2Router: INVALID_PATH');
        
        // Simplified swap logic - in production use actual AMM math
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        // For demo: assume 1:1 swap ratio
        uint amountOut = amountIn;
        require(amountOut >= amountOutMin, 'UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT');
        
        IERC20(path[path.length - 1]).transfer(to, amountOut);
        
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        amounts[path.length - 1] = amountOut;
        
        return amounts;
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        require(deadline >= block.timestamp, 'UniswapV2Router: EXPIRED');
        
        // Simplified liquidity logic
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountBDesired);
        
        return (amountADesired, amountBDesired, amountADesired + amountBDesired);
    }

    function getAmountsOut(uint amountIn, address[] memory path) 
        public 
        pure 
        returns (uint[] memory amounts) 
    {
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        // Simplified: 1:1 ratio
        for (uint i = 1; i < path.length; i++) {
            amounts[i] = amountIn;
        }
        return amounts;
    }
}
