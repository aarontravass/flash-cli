import Bundlr from "@bundlr-network/client";

const BUNDLR_NETWORK = "http://node1.bundlr.network"

const uploadDir = async (dir: string, privKey: string, currency) => {
  const bundlr = new Bundlr(BUNDLR_NETWORK, currency, privKey);
  console.log(`Connected to ${BUNDLR_NETWORK}`)
  
}