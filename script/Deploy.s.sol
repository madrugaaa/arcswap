// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/Factory.sol";
import "../contracts/Router.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy Factory
        UniswapV2Factory factory = new UniswapV2Factory(msg.sender);
        console.log("Factory deployed at:", address(factory));

        // Deploy Router
        UniswapV2Router router = new UniswapV2Router(address(factory));
        console.log("Router deployed at:", address(router));

        vm.stopBroadcast();

        // Log for easy copy-paste
        console.log("\n=== UPDATE YOUR arc.ts WITH THESE ADDRESSES ===");
        console.log("FACTORY_ADDRESS:", address(factory));
        console.log("ROUTER_ADDRESS:", address(router));
    }
}
