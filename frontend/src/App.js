
import './App.css';
import { useState, useRef, useEffect } from "react";
import { ethers } from "ethers"
import LandAbi from './contractsData/Land.json'
import LandAddress from './contractsData/Land-address.json'
import LandProcessAbi from './contractsData/LandProcess.json'
import LandProcessAddress from './contractsData/LandProcess-address.json'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator, Box
} from '@chakra-ui/react'

function App() {
  const [accounts, setAccount] = useState("0x")
  const [loading, setLoading] = useState("")
  const [landProcess, setLandProcess] = useState("")
  const [land, setLand] = useState("")

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
    // Get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    // Set signer
    const signer = provider.getSigner()

    window.ethereum.on('chainChanged', (chainId) => {
      window.location.reload();
    })

    window.ethereum.on('accountsChanged', async function (accounts) {
      setAccount(accounts[0])
      await web3Handler()
    })
   loadContracts(signer)
}
 const loadContracts = async (signer) => {
    // Get deployed copies of contracts
   const landProcess = new ethers.Contract(LandProcessAddress.address, LandProcessAbi.abi, signer)
    setLandProcess(landProcess)
    const land = new ethers.Contract(LandAddress.address, LandAbi.abi, signer)
    setLand(land)
    setLoading(false)
  }
  return (
    <div className="App">
  <Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href='#'>Home</BreadcrumbLink>
  </BreadcrumbItem>

  <BreadcrumbItem>
    <BreadcrumbLink href='#'>Docs</BreadcrumbLink>
  </BreadcrumbItem>

  <BreadcrumbItem isCurrentPage>
    <BreadcrumbLink href='#'>Breadcrumb</BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
<Box m={2}>Tomato</Box>

// You can also use custom values
<Box />

// sets margin `8px` on all viewports and `12px` from the first breakpoint and up
<Box m={[2, 3]} />
    </div>
  );
}

export default App;
