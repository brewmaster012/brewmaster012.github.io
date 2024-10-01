import {
    externalChainIDs,
    addDetails,
    nodeURL,
    RPCByChainID,
    corsProxyURL,
    hashServerURL,
    renderHeader, evmURL, evmTxURL
} from './common.js';

await renderHeader();
var web3 = new Web3(`${evmTxURL}`);


(async () => {
    var connectorABI, zetaTokenABI, erc20CustodyABI;

    async function readABIs() {
        try {
            let connectorABIFile = await fetch('abi/ZetaConnectorEth.json');
            let connectorABIJson = await connectorABIFile.json();
            connectorABI = connectorABIJson.abi;
            console.log("connectorABI", connectorABI);
            let zetaTokenABIFile = await fetch('abi/ZetaNonEth.json');
            let zetaTokenABIJson = await zetaTokenABIFile.json();
            zetaTokenABI = zetaTokenABIJson.abi;
            console.log("zetaTokenABI", zetaTokenABI);
            let erc20CustodyABIFile = await fetch('abi/ERC20Custody.json');
            let erc20CustodyABIJson = await erc20CustodyABIFile.json();
            erc20CustodyABI = erc20CustodyABIJson.abi;
            console.log("erc20CustodyABI", erc20CustodyABI);
        } catch (error) {
            console.log('error', error);
        }
    }

    await readABIs();

    // supported chains
    {
        fetch(`${nodeURL}/zeta-chain/observer/supportedChains`, {
            method: 'GET',
        }).then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            let div = document.getElementById('supported-chains');
            div.textContent = JSON.stringify(data, null, 2);
            let div2 = document.getElementById('supported-chains-summary');
            div2.appendChild(makeTableElement2(data.chains, ["chain_name", "chain_id"]));

        }).catch(error => {
            console.log("fetch error" + error);
        });
    }

    async function pendingOutboundQueue() {

        try {
            let resource = "zeta-chain/observer/TSS";
            let p1 = await fetch(`${nodeURL}/${resource}`, {
                method: 'GET',
            });
            let data = await p1.json();
            let TSS = data.TSS.tss_pubkey;
            console.log("TSS", TSS);

            resource = "zeta-chain/observer/pendingNonces";
            let p2 = await fetch(`${nodeURL}/${resource}`, {method: 'GET',});
            let data2 = await p2.json();
            let pending = data2.pending_nonces;
            pending = pending.filter((x) => (x.tss == TSS && x.chain_id != "7001"));
            console.log("PENDING", pending);
            const t1 = Date.now()
            for (let i=0; i<pending.length; i++) {
                let p = pending[i]
                try {
                    resource = `zeta-chain/crosschain/cctx/${p.chain_id}/${p.nonce_low}`;
                    let p3 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
                    let data3 = await p3.json();
                    console.log("chain data8", data3);
                    const in_params = data3.CrossChainTx.inbound_params;
                    console.log("in_params", in_params);
                    const in_bn = in_params.observed_external_height;
                    console.log("in_bn", in_bn);
                    const block = await web3.eth.getBlock(in_bn);
                    console.log("block timestamp", block.timestamp);
                    const t2 = new Date(block.timestamp * 1000);
                    console.log("t2", t2);
                    const diff_time = t1 - t2;
                    let differenceInMinutes = diff_time / 1000 / 60;
                    console.log("diff_time_minutes", differenceInMinutes);
                    p.first_pending_time_minutes = differenceInMinutes;
                } catch (error) {
                    console.log('error', error);
                }
            }


            let p = [];
            // for (let i = 0; i < pending.length; i++) {
            // 	let chainID = pending[i].chain_id;
            // 	let resource = `${nodeURL}/zeta-chain/crosschain/cctxPending?chainId=${chainID}&pagination.limit=1`;
            // 	p[i] = await fetch(resource, {method: 'GET'});
            // 	if (p[i].ok) {
            // 	    let data = await p[i].json();
            // 	    console.log("data", data);
            // 	    if (data.CrossChainTx.length > 0){
            // 		// pending[i].first_pending_cctx = data.CrossChainTx[0].index;

            // 	    }
            // 	}
            // }


            let pre = document.getElementById("pending-outbound-queues");
            pre.textContent = JSON.stringify(data2, null, 2);

            let div = document.getElementById("pending-outbound-queues-summary");
            div.appendChild(makeTableElement2(pending, ["chain_id", "nonce_low", "nonce_high", "first_pending_time_minutes"]));

        } catch (error) {
            console.log('error', error);
        }
    }

    pendingOutboundQueue();

    async function blockHeaderState() {
        const states = [];
        for (let i = 0; i < externalChainIDs.length; i++) {
            const chainID = externalChainIDs[i];
            try {
                let resource = `zeta-chain/observer/get_block_header_state_by_chain_id/${chainID}`;
                let p2 = await fetch(`${nodeURL}/${resource}`, {method: 'GET',});
                let data2 = await p2.json();
                console.log("chainid", chainID, data2);
                const state = data2.block_header_state;
                if (state) states.push(state);
            } catch (error) {
                console.log('error', error);
            }
        }
        console.log("states", states);
        let div = document.getElementById("block-header-state-summary");
        div.appendChild(makeTableElement2(states, ["chain_id", "earliest_height", "latest_height"]));
    }

    blockHeaderState();


    async function externalContractAddress() {
        try {
            let resource = "zeta-chain/observer/get_chain_params";
            let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
            let data = await p1.json();
            console.log(data);
            let pre = document.getElementById("external-contract-addresses");
            pre.textContent = JSON.stringify(data.chain_params, null, 2);
            let div = document.getElementById("external-contract-addresses-summary");
            div.appendChild(makeTableElement2(data.chain_params.chain_params, ["chain_id", "zeta_token_contract_address", "connector_contract_address", "erc20_custody_contract_address"]));
        } catch (error) {
            console.log('error', error);
        }
    }

    externalContractAddress();


    async function validateContracts(chain_id) {
        const deployer = "0x55122f7590164Ac222504436943FAB17B62F5d7d";
        try {
            appendMessage(`validating the three contracts on chain_id = ${chain_id}`);
            let resource = `zeta-chain/observer/get_client_params_for_chain/${chain_id}`;
            let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
            let data = await p1.json();
            console.log(data);
            let connectorAddr = data.core_params.connector_contract_address;
            let zetaTokenAddr = data.core_params.zeta_token_contract_address;
            let erc20CustodyAddr = data.core_params.erc20_custody_contract_address;
            console.log("connectorAddr", connectorAddr);
            console.log("zetaTokenAddr", zetaTokenAddr);
            console.log("erc20CustodyAddr", erc20CustodyAddr);

            resource = `zeta-chain/crosschain/get_tss_address`;
            let p2 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
            let data2 = await p2.json();
            let tssAddr = data2.eth;
            console.log("tssAddr", tssAddr);
            appendMessage(`tssAddr = ${tssAddr}`);
            appendMessage(`deployer = ${deployer}`);
            appendMessage("");

            let web3 = new Web3(RPCByChainID[chain_id]);
            let connectorContract = new web3.eth.Contract(connectorABI, connectorAddr);
            console.log("connectorContract", connectorContract);
            let res = await connectorContract.methods.tssAddress().call();
            console.log("connectorContract.tssAddress()", res);
            // appendMessage(`connectorContract.tssAddress() = ${res}`);
            if (res == tssAddr) {
                appendMessage(`OK: Connector: TSS address match;`);
            } else {
                appendMessage(`ERROR: Connector: TSS address mismatch;`);
            }
            res = await connectorContract.methods.tssAddressUpdater().call();
            if (res == deployer) {
                appendMessage(`OK: Connector: TSS address updater match;`);
            } else {
                appendMessage(`ERROR: connectorContract.tssAddressUpdater() = ${res}`);
            }

            let res2 = await connectorContract.methods.zetaToken().call();
            // appendMessage(`connectorContract.zetaToken() = ${res2}`);
            // appendMessage(`zetaTokenAddr = ${zetaTokenAddr}`);
            if (res2.toLowerCase() == zetaTokenAddr.toLowerCase()) {
                appendMessage(`OK: Connector: zetaToken address match;`);
            } else {
                appendMessage(`ERROR: Connector: zetaToken address mismatch;`);
            }

            try {
                let erc20CustodyContract = new web3.eth.Contract(erc20CustodyABI, erc20CustodyAddr);
                let res3 = await erc20CustodyContract.methods.TSSAddress().call();
                // appendMessage(`erc20CustodyContract.TSSAddress() = ${res3}`);
                // appendMessage(`tssAddr = ${tssAddr}`);
                if (res3.toLowerCase() == tssAddr.toLowerCase()) {
                    appendMessage(`OK: ERC20Custody:TSS address match;`);
                } else {
                    appendMessage(`ERROR: ERC20Custody: TSS address mismatch;`);
                }
                let res4 = await erc20CustodyContract.methods.TSSAddressUpdater().call();
                if (res4 == deployer) {
                    appendMessage(`OK: ERC20Custody: TSS address updater match;`);
                } else {
                    appendMessage(`ERROR: erc20CustodyContract.TSSAddressUpdater() = ${res4}`);
                }

            } catch (error) {
                console.log('error', error);
            }

            try {
                let zetaTokenContract = new web3.eth.Contract(zetaTokenABI, zetaTokenAddr);
                let res3 = await zetaTokenContract.methods.connectorAddress().call();
                // appendMessage(`zetaTokenContract.connectorAddress() = ${res3}`);
                // appendMessage(`connectorAddr = ${connectorAddr}`);
                if (res3.toLowerCase() == connectorAddr.toLowerCase()) {
                    appendMessage(`OK: ZetaToken: connector address match;`);
                } else {
                    appendMessage(`ERROR: ZetaToken: connector address mismatch;`);
                }

                let res4 = await zetaTokenContract.methods.tssAddress().call();
                // appendMessage(`zetaTokenContract.tssAddress() = ${res4}`);
                // appendMessage(`tssAddr = ${tssAddr}`);
                if (res4.toLowerCase() == tssAddr.toLowerCase()) {
                    appendMessage(`OK: ZetaToken: TSS address match;`);
                } else {
                    appendMessage(`ERROR: ZetaToken: TSS address mismatch;`);
                }

                let res5 = await zetaTokenContract.methods.tssAddressUpdater().call();
                if (res5 == deployer) {
                    appendMessage(`OK: ZetaToken: TSS address updater match;`);
                } else {
                    appendMessage(`ERROR: zetaTokenContract.tssAddressUpdater() = ${res5}`);
                }
            } catch (error) {
                console.log('error', error);
            }
            appendMessage(``);

        } catch (error) {
            console.log('error', error);
        }
    }


    async function validate() {
        await validateContracts(5);
        await validateContracts(97);
        await validateContracts(80001);
    }

    // document.getElementById("validate-contracts").onclick = validate;

    // validate();


    function appendMessage(message, consoleID = "console") {
        var textbox = document.getElementById(consoleID);
        textbox.value += message + "\n";
    }

    function clearConsole(consoleID = "console") {
        var textbox = document.getElementById(consoleID);
        textbox.value = "";
    }

    async function cctxByHash(hash) {
        let resource = `zeta-chain/crosschain/cctx/${hash}`;
        let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
        let data = await p1.json();
        return data;
    }

    // intxHash => cctx index
    async function inTxHashToCCTXIndex(intxHash) {
        let resource = `zeta-chain/crosschain/inTxHashToCctx/${intxHash}`;
        let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
        if (!p1.ok) {
            return null;
        }
        let data = await p1.json();
        return data;
    }

    // document.getElementById("input-debug-intx").onchange = async function () {
    //     let intxHash = document.getElementById("input-debug-intx").value;
    //     const cctxIndex = await inTxHashToCCTXIndex(intxHash);
    //     console.log("cctxIndex", cctxIndex);
    //     if (cctxIndex) {
    //         document.getElementById("input-debug-cctx").value = cctxIndex.inTxHashToCctx.cctx_index;
    //     }
    // };
    // document.getElementById("button-debug-intx").onclick = document.getElementById("input-debug-intx").onchange;

    async function debugCCTX() {
        function append(message) {
            appendMessage(message, "console-debug-cctx");
        }

        clearConsole("console-debug-cctx");
        let input = document.getElementById("input-debug-cctx").value;
        if (input.length != 66) {
            append("ERROR: input.length != 66");
            return;
        }
        append("Querying CCTX by hash...");
        let cctx = await cctxByHash(input);
        let pre = document.getElementById("cctx-json");
        pre.innerText = JSON.stringify(cctx, null, 2);
        append(`OK: found CCTX ${input}`);
        append(`Checking CCTX status...`);
        // debug session
        const status = cctx.CrossChainTx.cctx_status;
        const outParams = cctx.CrossChainTx.outbound_tx_params;
        const curOutParam = outParams[outParams.length - 1];
        console.log(curOutParam);
        const cc = cctx.CrossChainTx;

        if (status.status == "OutboundMined") {
            append("OK: CCTX status is OutboundMined");
            append("  Checking outbound tx confirmation votes...");
            const chainID = curOutParam.receiver_chainId;
            const txhash = curOutParam.outbound_tx_hash;
            append("  outbound chainID: " + chainID);
            if (txhash.length == 66) {
                const receipt = await getReceipt(chainID, txhash);
                append("  txhash: " + txhash);
                append("  receipt: " + JSON.stringify(receipt, null, 2));
            }
            // const ballotIndex = await getOutTxBallot(cc.index, curOutParam.outbound_tx_hash, outBlockHeight, amount, chainId, nonce, coinType);
        } else if (status.status == "Aborted") {
            append("OK: CCTX status is Aborted");
            append(`  Aborted reason: ${status.status_message}`);
        } else if (status.status == "PendingOutbound") {
            append("PENDING: CCTX status is PendingOutbound");
            append("  Is it OK to be in PENDING at this time?");

            const finalizedBlock = cctx.CrossChainTx.inbound_tx_params.inbound_tx_finalized_zeta_height;
            append("    inTx finalized at Zeta block " + finalizedBlock);

            let currentBlock = await getCurrentBlock();
            append(`    current block is ${currentBlock}`);
            const passedBlocks = currentBlock - finalizedBlock;
            append(`    ${passedBlocks} blocks has passed; roughly ${passedBlocks * 5} seconds`);
            if (passedBlocks > 100) {
                append("    ERROR: CCTX has been in PendingOutbound for too long");
            } else {
                append("    OK: CCTX has been in PendingOutbound for a reasonable time; please wait.");
            }
            append(`  Why was it in PENDING for so long?`);
            append(`    Has outbound tx been keysigned and broadcasted? Checking txtracker...`);
            const outChainID = curOutParam.receiver_chainId;
            const outNonce = curOutParam.outbound_tx_tss_nonce;
            console.log("outChainID", outChainID);
            console.log("outNonce", outNonce);
            let txtracker = await getTxTracker(outChainID, outNonce);
            if (txtracker == 404) {
                append("    ERROR: txtracker not found");
                append("");
                append("This likely suggest that keysign failure and no outbound tx has been signed/broadcasted");
            } else {
                const txhash = txtracker.outTxTracker.hash_list[0].tx_hash;
                const chainId = outChainID;
                append("    OK: txtracker found: ");
                append(`      txhash: ${txtracker.outTxTracker.hash_list[0].tx_hash}`);
                append(`    verifying this txhash on external chain...`);
                const receipt = getReceipt(chainId, txhash);
                if (receipt) {
                    append(`      OK: found txhash receipt on external chain`);
                    append(`      Getting the outtx confirmation ballot...`);
                    const ballotIndex = await getOutTxBallot(cc.index, curOutParam.outbound_tx_tss_nonce, curOutParam.outbound_tx_params.outbound_tx_amount, chainId, curOutParam.outbound_tx_params.outbound_tx_nonce, curOutParam.outbound_tx_params.outbound_tx_coin_type);
                    if (ballotIndex == 404) {
                        append(`      ERROR: ballot not found`);
                    } else {
                        append(`      OK: ballot found: ${ballotIndex}`);
                    }

                    append("");
                    append("Diagnosis: Failure to observe and report outbound tx on external chain");
                } else {
                    append(`      ERROR: cannot find txhash`);
                    append("");
                    append(`Diagnosis: txtrack may have contained invalid txhash; check ${txhash} on chain ${chainId} manually to verify`);
                }

            }

        }
    }

    // document.getElementById("button-debug-cctx").addEventListener("click", debugCCTX);

    async function getReceipt(chainId, txhash) {
        const rpcEndpoint = RPCByChainID[chainId];
        if (rpcEndpoint == null) {
            console.log(`ERROR: chainId ${chainId} not supported`);
            return null;

        }
        const payload = {
            jsonrpc: '2.0',
            id: 1,
            method: 'eth_getTransactionReceipt',
            params: [txhash],
        };
        const p2 = await fetch(rpcEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        if (!p2.ok) {
            console.log(`ERROR: fetch is not ok`);
            return null;
        }
        if (p2.status != 200) {
            console.log(`ERROR: status ${p2.status}; wanted 200`);
            return null;
        }
        const data2 = await p2.json();
        return data2;
    }

    console.log("receipt", await getReceipt(97, "0xc5e9a96c0534dec3d12806e43fa5cf597816a5933cfb4644ce81e3dc501899e7"));


    async function getCurrentBlock() {
        let resource = `zeta-chain/crosschain/lastZetaHeight`;
        let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
        let data = await p1.json();
        return data.Height;
    }

    async function getTxTracker(chainId, nonce) {
        let resource = `zeta-chain/crosschain/outTxTracker/${chainId}/${nonce}`;
        let p1 = await fetch(`${nodeURL}/${resource}`, {method: 'GET'});
        if (p1.status == 404) {
            return 404;
        }
        let data = await p1.json();
        return data;
    }

// type OutTxDigestRequest struct {
// 	SendHash       string `json:"sendHash"`
// 	OutTxHash      string `json:"outTxHash"`
// 	OutBlockHeight uint64 `json:"outBlockHeight"`
// 	Amount         string `json:"amount"`
// 	ChainID        int64  `json:"chainID"`
// 	Nonce          uint64 `json:"nonce"`
// 	CoinType       string `json:"coinType"`
// }
    async function getOutTxBallot(sendHash, outTxHash, outBlockHeight, amount, chainId, nonce, coinType) {
        let endpoint = `${corsProxyURL}/${hashServerURL}/out_tx_digest`;
        const payload = {
            method: "hash.OutTxDigest",
            params: [{
                sendHash: sendHash,
                outTxHash: outTxHash,
                outBlockHeight: outBlockHeight,
                amount: amount,
                chainID: chainId,
                nonce: nonce,
                coinType: coinType,
            }],
            id: "1",
        };
        let p1 = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        if (!p1.ok) {
            console.log("p1 not ok");
            return null;
        }
        let data = await p1.json();
        if (data.error) {
            console.log("data.error", data.error);
            return null;
        }
        return data.result.digest;
    }

    // self test
    let d = await getOutTxBallot("0x598fdd00ef3e0c62f65b388095c7e1f87795908da002962e0a27a2113e10ce32",
        "0xb8c8707dc8e90673dcde2c4799a2c0d35acc1b43a8b3f93c9d9661b715cac193",
        30635730,
        "0",
        97,
        0,
        "Zeta");
    const expectedHash = "0x3bc920a14e8fa9885a0940c084dd5c921c191d81bf018e7e7ed9cf342e0008bc";
    if (d != expectedHash) {
        console.log(`ballot test: hash mismatch: wanted ${expectedHash}; got ${d}`);
    } else {
        console.log("OK: ballot test: hash match");
    }

    async function getOutTxBallotFromCctx(cctx) {
        const sendHash = cctx.Crosschain.index;
        for (let i = 0; i < cctx.CrossChainTx.outbound_tx_params.length; i++) {
            const outTxParam = cctx.CrossChainTx.outbound_tx_params[i];
            const txhash = outTxParam.outbound_tx_hash;

        }
    }

    // tx tracker stuff
    (async () => {
        const resource = `${nodeURL}/zeta-chain/crosschain/outTxTracker`;
        let p1 = await fetch(resource, {method: 'GET'});
        let data = await p1.json();
        console.log("txtracker data", data);
        const txs = data?.outboundTracker;
        const div = document.getElementById("txtracker");
        for (let i = 0; i < txs.length; i++) {
            const tx = txs[i];
            div.appendChild(addDetails(`${tx.index}`, JSON.stringify(tx.hash_list, null, 2)));

        }

    })();

    // pending cctxs
    (async () => {
        const div = document.getElementById("pending");
        for (let i = 0; i < externalChainIDs.length; i++) {
            let chainID = externalChainIDs[i];
            let resource = `${nodeURL}/zeta-chain/crosschain/pendingCctx?chainId=${chainID}&pagination.limit=1`;
            let p = await fetch(resource, {method: 'GET'});
            const pendingNonces = [];
            if (p.ok) {
                let data = await p.json();
                for (let j = 0; j < data.CrossChainTx.length; j++) {
                    let cctx = data.CrossChainTx[j];
					console.log("cctx", cctx);
                    const outs = cctx.outbound_params;
                    const out = outs[outs.length - 1];
                    pendingNonces.push(out.tss_nonce);
                }
                console.log(`pending cctx chain id ${chainID}`, data);
                div.appendChild(addDetails(`pending cctx chainID ${chainID}; #nonces: ${data.CrossChainTx.length}; nonces: ${pendingNonces}`, JSON.stringify(data.CrossChainTx, null, 2)));
            }
        }
    })();

})();
