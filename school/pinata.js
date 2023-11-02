const FormData = require("form-data")
const fetch = require("node-fetch")
const fs = require("fs")
require('dotenv').config()



const uploadImage = async (file, title) => {
  try {
    const data = new FormData()
    data.append("file", fs.createReadStream(file))
    data.append("pinataMetadata", '{"name": "Land"}')

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: data
    })
    resData = await res.json()
    console.log("File uploaded, CID:", resData.IpfsHash)
    return resData.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

const uploadMetadata = async (name, description, external_url, CID) => {
  try {
    const data = JSON.stringify({
      pinataContent: {
        name: `${name}`,
        description: `${description}`,
        external_url: `${external_url}`,
        image: `ipfs://${CID}`,
      },
      pinataMetadata: {
        name: "Land NFT Metadata",
      },
    });

    const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PINATA_JWT}`
      },
      body: data
    })
    const resData = await res.json()
    console.log("Metadata uploaded, CID:", resData.IpfsHash)
    return resData.IpfsHash
  } catch (error) {
    console.log(error)
  }
}

const mintNft = async (CID, wallet) => {
  try {
    const data = JSON.stringify({
      recipient: `sepolia:${wallet}`,
      metadata: `https://gateway.pinata.cloud/ipfs/${CID}`
    })
    const res = await fetch("https://staging.crossmint.com/api/2022-06-09/collections/default/nfts", {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'x-client-secret': `${process.env.CROSSMINT_CLIENT_SECRET}`,
        'x-project-id': `${process.env.CROSSMINT_PROJECT_ID}`
      },
      body: data
    })
    resData = await res.json()
    console.log(resData)
    const contractAddress = resData.onChain.contractAddress
    console.log("NFT Minted, smart contract:", contractAddress)
    console.log(`View NFT at https://testnets.opensea.io/assets/sepolia/${contractAddress}`)
  } catch (error) {
    console.log(error)
  }
}

const main = async (file, name, description, external_url, wallet) => {
  try {
    const imageCID = await uploadImage(file)
    const metadataCID = await uploadMetadata(name, description, external_url, imageCID)
    await mintNft(metadataCID, wallet)
  } catch (error) {
    console.log(error)
  }
}

main(
  "./plot.png",
  "Plot",
  "A Plot in Luwinga side",
  "https://pinata.cloud",
  "0xC4DaB50AA4E739522973ac7b2d398cbFa6973cf2"
)
