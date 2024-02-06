export var nodeURL;
export var evmURL;
export var corsProxyURL;
export var checkURL;
export var tmURL;
export var hashServerURL;
export var RPCByChainID;
export var AddressExplorerByChainID;
export var esploraAPIURL;
export var externalChainIDs;
export var Chains;
export var zetaclientIPs;
export var bitcoinChainID; 
var zetaIP;
var auxIP = "46.4.15.110";
var zetaChainID;

// Step 0: Inject HTML
const widgetContainer = document.createElement("div");
const selectHTML = `
  <label for="networkSelector">Choose a network:</label>
  <select id="networkSelector">
    <option value="athens3">Athens 3</option>
    <option value="mockmain">Mock Main</option>
    <option value="mainnet">Mainnet</option>
  </select>
`;
widgetContainer.innerHTML = selectHTML;
// add widgetConainter to the body of the page
document.body.prepend(widgetContainer);

// Step 1: Get the select element by its ID
const networkSelector = document.getElementById("networkSelector");

// Step 2: Load saved network choice from localStorage if it exists
const savedNetwork = localStorage.getItem("network");
if (savedNetwork) {
    networkSelector.value = savedNetwork;
}

// Step 3: Add event listener for when the selection changes
networkSelector.addEventListener("change", function() {
    const selectedNetwork = networkSelector.value;

    // Step 4: Save the selection to localStorage
    localStorage.setItem("network", selectedNetwork);
    alert("refresh your page to take effect");
});
export var network = localStorage.getItem("network");
if (network == "mockmain") {
    bitcoinChainID = 8332; 
    zetaIP =  "100.113.213.95";
    nodeURL = `http://${zetaIP}:1317`;
    evmURL = `http://${zetaIP}:8545`;
    corsProxyURL = `http://${auxIP}:8088`;
    checkURL = `http://${auxIP}:8888`; // remote server that tests port 6668 p2p nodes
    tmURL = `http://${zetaIP}:26657`;
    hashServerURL = `http://${auxIP}:9001`;
    RPCByChainID[zetaChainID] = evmURL;
    zetaChainID = 70000;
    RPCByChainID = {
        1: "https://eth.llamarpc.com",
        56: "https://binance.llamarpc.com",
        8332: "https://blockstream.info/api",
        70000: evmURL,
    };
    AddressExplorerByChainID = {
        1: "https://www.etherscan.io/address",
        56: "https://www.bscscan.com/address",
        8332: "https://blockstream.info/address",
    };
    esploraAPIURL = "https://blockstream.info/api";
    externalChainIDs = [1,56,8332];

    Chains = {
        1: {
            "chainId": "1",
            "chainName": "Ethereum Mainnet",
            "nativeCurrency": {
                "name": "Ether",
                "symbol": "ETH",
                "decimals": 18
            },
        },
        56: {
            "chainId": "56",
            "chainName": "Binance Smart Chain",
            "nativeCurrency": {
                "name": "BNB",
                "symbol": "BNB",
                "decimals": 18
            },
        },
        70000: {
            "chainId": "70000",
            "chainName": "ZetaChain",
            "nativeCurrency": {
                "name": "Zeta",
                "symbol": "ZETA",
                "decimals": 18
            },
        },
        8332: {
            "chainId": "8332",
            "chainName": "Bitcoin Mainnet",
            "nativeCurrency": {
                "name": "Bitcoin",
                "symbol": "tBTC",
                "decimals": 8
            },
        }
    };
    zetaclientIPs = ["50.16.78.24", "44.218.42.109","44.216.230.163"];
} else if (network == "mainnet") {
    nodeURL = `https://zetachain-mainnet-archive.allthatnode.com:1317`;
    evmURL = `https://zetachain-mainnet-archive.allthatnode.com:8545`;
    tmURL = `https://zetachain-mainnet-archive.allthatnode.com:26657`;
    corsProxyURL = `http://${auxIP}:8088`;
    checkURL = `http://${auxIP}:8888`; // remote server that tests port 6668 p2p nodes
    hashServerURL = `http://${auxIP}:9001`;
    RPCByChainID[zetaChainID] = evmURL;


    bitcoinChainID = 8332; 

    zetaChainID = 7000;
    RPCByChainID = {
        1: "https://eth.llamarpc.com",
        56: "https://binance.llamarpc.com",
        8332: "https://blockstream.info/api",
        7000: evmURL,
    };
    AddressExplorerByChainID = {
        1: "https://www.etherscan.io/address",
        56: "https://www.bscscan.com/address",
        8332: "https://blockstream.info/address",
    };
    esploraAPIURL = "https://blockstream.info/api";
    externalChainIDs = [1,56,8332];

    Chains = {
        1: {
            "chainId": "1",
            "chainName": "Ethereum Mainnet",
            "nativeCurrency": {
                "name": "Ether",
                "symbol": "ETH",
                "decimals": 18
            },
        },
        56: {
            "chainId": "56",
            "chainName": "Binance Smart Chain",
            "nativeCurrency": {
                "name": "BNB",
                "symbol": "BNB",
                "decimals": 18
            },
        },
        7000: {
            "chainId": "7000",
            "chainName": "ZetaChain",
            "nativeCurrency": {
                "name": "Zeta",
                "symbol": "ZETA",
                "decimals": 18
            },
        },
        8332: {
            "chainId": "8332",
            "chainName": "Bitcoin Mainnet",
            "nativeCurrency": {
                "name": "Bitcoin",
                "symbol": "tBTC",
                "decimals": 8
            },
        }
    };
    // zetaclientIPs = ["50.16.78.24", "44.218.42.109","44.216.230.163"];
    zetaclientIPs = [
        "34.225.36.174",
        "52.45.59.77",
        "52.35.128.130",
        "35.87.167.186",
        "54.212.38.135",
        "150.136.225.11",
        "129.146.167.182",
        "208.91.106.108",
        "15.235.10.84"
    ];

} else { // default to athens3
    bitcoinChainID = 18332; 
    network = "athens3";
    // zetaIP = '46.4.15.110';
    nodeURL = `https://zetachain-athens.blockpi.network/lcd/v1/public`;
    evmURL = `https://zetachain-athens-evm.blockpi.network/v1/rpc/public`;
    tmURL = `https://zetachain-athens.blockpi.network/rpc/v1/public`;
    corsProxyURL = `http://${auxIP}:8088`;
    checkURL = `http://${auxIP}:8888`; // remote server that tests port 6668 p2p nodes
    hashServerURL = `http://${auxIP}:9001`;

    zetaChainID = 7001
    RPCByChainID = {
        5: "https://rpc.ankr.com/eth_goerli",
        97: "https://data-seed-prebsc-1-s1.binance.org:8545",
        80001: "https://rpc.ankr.com/polygon_mumbai",
        18332: "https://blockstream.info/testnet/api",
        7001: evmURL,
    };
    AddressExplorerByChainID = {
        5: "https://goerli.etherscan.io/address",
        97: "https://testnet.bscscan.com/address",
        80001: "https://mumbai.polygonscan.com/address",
        18332: "https://blockstream.info/testnet/address",
    };
    esploraAPIURL = "https://blockstream.info/testnet/api";
    externalChainIDs = [5, 97, 80001, 18332];

    Chains = {
        5: {
            "chainId": "5",
            "chainName": "Goerli Testnet",
            "nativeCurrency": {
                "name": "Goerli Ether",
                "symbol": "gETH",
                "decimals": 18
            },
        },
        97: {
            "chainId": "97",
            "chainName": "Binance Smart Chain Testnet",
            "nativeCurrency": {
                "name": "Testnet BNB",
                "symbol": "tBNB",
                "decimals": 18
            },
        },
        80001: {
            "chainId": "80001",
            "chainName": "Polygon Mumbai Testnet",
            "nativeCurrency": {
                "name": "Matic",
                "symbol": "tMATIC",
                "decimals": 18
            },
        },
        7001: {
            "chainId": "7001",
            "chainName": "ZetaChain",
            "nativeCurrency": {
                "name": "Zeta",
                "symbol": "ZETA",
                "decimals": 18
            },
        },
        18332: {
            "chainId": "18332",
            "chainName": "Bitcoin Testnet",
            "nativeCurrency": {
                "name": "Bitcoin",
                "symbol": "tBTC",
                "decimals": 8
            },
        }
    };
    zetaclientIPs = ["52.42.64.63", "150.136.176.81",
        // "202.8.10.137",
        // "35.210.142.91",
        "bd-validator-01.testnet.zetachain.bdnodes.net",
        "54.39.18.86",
        "34.239.99.239",
        "3.218.170.198",
        "18.210.106.52",
        "44.236.174.26",
        "35.162.231.114",
        "54.77.180.134",
        "34.253.137.241",
        "18.143.71.236",
        "54.254.133.239",
    ];
}


// corsProxyURL = `http://${auxIP}:8088`;
// checkURL = `http://${auxIP}:8888`; // remote server that tests port 6668 p2p nodes
// hashServerURL = `http://${auxIP}:9001`;
RPCByChainID[zetaChainID] = evmURL;



export async function getForegienCoins() {


    const url = `${nodeURL}/zeta-chain/fungible/foreign_coins`;
    const p1 = await fetch(url, {  method: 'GET', });
    const data = await p1.json();
    return data?.foreignCoins; 
}



export function addDetails(sum, det) {
    return DIV(
        DETAILS(
            SUMMARY(TEXT(sum)),
            PRE(TEXT(det))
        ));
}

export function addDetails2(sum,detElement) {
    return DIV(
        DETAILS(
            SUMMARY(TEXT(sum)),
            detElement
        ));
}

export function  timeSince(date) {
    const now = new Date();
    const secondsPast = (now.getTime() - date.getTime()) / 1000;

    if (secondsPast < 60) {
        return `${parseInt(secondsPast)}s ago`;
    }
    if (secondsPast < 3600) {
        return `${parseInt(secondsPast / 60)}m ago`;
    }
    if (secondsPast <= 86400) {
        return `${parseInt(secondsPast / 3600)}h${parseInt((secondsPast % 3600) / 60)}m ago`;
    }
    // Handle cases for more than one day here if needed
}

export function msToTime(duration) {
    let seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24),
        days = parseInt((duration / (1000 * 60 * 60 * 24)));

    let result = "";

    if(days) { result += days + "d"; }
    if(hours) { result += hours + "h"; }
    if(minutes) { result += minutes + "m"; }
    if(seconds) { result += seconds + "s"; }

    return result.trim();
}

// const Web3 = require('web3');

export function base64ToUtf8(base64String) {
    if (base64String == null) {
	return "null";
    }
    const binaryString = atob(base64String);

    return binaryString;
}

export function parseHexString(hexString) {
  var bytes = [];
  for (var i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return bytes;
}


// Function to add commas to a number string so "1234567" will
// turn into "1,234,567"
export function addCommas(numberString) {
    var parts = numberString.split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

export function makeTableElementNew(json) {
    const body = TBODY();
    for (const field in json) {
        const row = TR(
            TD(TEXT(field)),
            TD(TEXT(json[field]))
        );
        body.appendChild(row);
    }
    return TABLE(body); 
}

// simple utility to turn a JSON object into a HTML table element;
// two columns: "JSON key", "JSON value";
// each row is a field in JSON object. 
export function makeTableElement(json) {
    // create a table
    var table = document.createElement('table');

    // create table header
    var thead = document.createElement('thead');
    table.appendChild(thead);

    // create table body
    var tbody = document.createElement('tbody');

    // iterate over the JSON object
    for (var field in json) {
	    // create a row for each field
	    var tr = document.createElement('tr');
	    
	    // create a cell for the field name
	    var td1 = document.createElement('td');
	    td1.textContent = field;
	    tr.appendChild(td1);
	    
	    // create a cell for the field value
	    var td2 = document.createElement('td');
	    td2.textContent = json[field];
	    tr.appendChild(td2);
	    
	    // add the row to the table body
	    tbody.appendChild(tr);
    }

    // append the body to the table
    table.appendChild(tbody);

    // append the table to the body of the page
    return table; 

}

// given a JSON array, turn it into a table; each row is
// one element in JSON array; each column is a field;
// the list of interested fields are specified by the fields
// string array
export function makeTableElement2(jsonArray, fields) {
    // create a table
    var table = document.createElement('table');

    // create table header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    fields.forEach(header => {
	var th = document.createElement('th');
	th.textContent = header;
	headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // create table body
    var tbody = document.createElement('tbody');

    // iterate over the JSON object
    jsonArray.forEach( row => {
	// console.log("row", row);
	// create a row for each field
	var tr = document.createElement('tr');

	fields.forEach( field => {
	    var td = document.createElement('td');
	    td.textContent = row[field];
	    tr.appendChild(td);
	});
	table.appendChild(tr);
    });

    // append the body to the table
    table.appendChild(tbody);

    // append the table to the body of the page
    return table; 

}



export function utcToLocal(utcString) {
    let utcDate = new Date(utcString);
    return utcDate.toLocaleString();
}


// tx_resp is JSON array of tx_responses
// tx is JSON array of tx
export function txResponsesToTable(tx_resp) {
    if (tx_resp.length == 0) {
	console.log("error: tx.length == 0",  tx.length);
	return;
    }

    // create a table
    var table = document.createElement('table');

    // create table header
    var thead = document.createElement('thead');
    var headerRow = document.createElement('tr');
    let fields = ["tx_hash", "code", "log"];
    fields.forEach(header => {
	var th = document.createElement('th');
	th.textContent = header;
	headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // create table body
    var tbody = document.createElement('tbody');

    for (var i = 0; i < tx_resp.length; i++) {
	var tr = document.createElement('tr');
	var row = {};
	let tx = tx_resp[i].tx;
	let msg_type = tx["body"].messages[0]["msgs"][0]["@type"];
	let txhash = tx_resp[i].txhash;
	row["tx_hash"] = `${txhash}<br>${msg_type}`
	row["code"] = tx_resp[i].code;
	var raw_log = tx_resp[i].raw_log;
	// console.log(JSON.parse(raw_log));
	var log_elm; 
	try {
	    var log = JSON.parse(raw_log);
	    log_elm = document.createElement('pre');
	    log_elm.textContent = JSON.stringify(log, null, 2);
	} catch (e) {
	    log_elm = document.createElement('div');
	    log_elm.textContent = raw_log;
	}

	let div = document.createElement('div');
	div.classList = "tooltip";
	div.appendChild(document.createTextNode("hover"));
	// span.classList = "tooltiptext";
	log_elm.classList = "tooltiptext";
	div.appendChild(log_elm);

	
	row["log"] = div.outerHTML;
	// row["log"] = tx_resp[i].raw_log;
	fields.forEach( field => {
	    var td = document.createElement('td');
	    td.innerHTML = row[field];
	    tr.appendChild(td);
	});
	tbody.appendChild(tr);
    }

    // iterate over the JSON object
    // jsonArray.forEach( row => {
    // 	// console.log("row", row);
    // 	// create a row for each field
    // 	var tr = document.createElement('tr');

    // 	fields.forEach( field => {
    // 	    var td = document.createElement('td');
    // 	    td.textContent = row[field];
    // 	    tr.appendChild(td);
    // 	});
    // 	table.appendChild(tr);
    // });

    // append the body to the table
    table.appendChild(tbody);

    // append the table to the body of the page
    return table;     

}



// array of int8 (length 20) to hex string (eth address format)
export function int8ArrayToHex(array) {
    if (array.length != 20) {
	console.log("error: array.length != 20", array.length);
	return;
    }
    let hexString = array.map(num => {
	let hex = num.toString(16);
	if (hex.length < 2) {
            hex = '0' + hex;
	}
	return hex;
    }).join('');

    hexString = '0x' + hexString;
    return Web3.utils.toChecksumAddress(hexString);
}

// array of int8 (length any) to hex string 
export function int8ArrayToHexRelaxed(array) {

    let hexString = array.map(num => {
	let hex = num.toString(16);
	if (hex.length < 2) {
            hex = '0' + hex;
	}
	return hex;
    }).join('');

    hexString = '0x' + hexString;
    return hexString;
}

// amount in smallest denomination (wei, satoshi, etc), convert into (eth, btc, etc)
// amount is string; decimals is Number; return Number
export function fromDecimals(amount, decimals) {
    return Number(BigInt(amount)) / Math.pow(10, decimals);
}


export function renderHeader() {
    var headerHTML = `
<div id="links" style="text-align: center;font-size: 20px;display: flex;justify-content: space-between;">
    <span class="flexible-filler"></span>
    <a href="./index.html">Basics</a>  <span class="flexible-filler"></span>
    <a href="./zevm.html">zEVM</a>  <span class="flexible-filler"></span>
    <a href="./zetaclients.html">ZetaClients</a>  <span class="flexible-filler"></span>
    <a href="./crosschain.html">Cross-Chain Module</a><span class="flexible-filler"></span>
    <a href="./params.html">Params</a><span class="flexible-filler"></span>
    <a href="./consensus.html">Consensus</a>       <span class="flexible-filler"></span>
    <a href="./wallet.html">Wallet</a>     <span class="flexible-filler"></span>
    <a href="./audit.html">Audit</a> <span class="flexible-filler"></span>
    <a href="./staking.html">Staking</a>
</div>
    `
    document.body.insertAdjacentHTML('afterbegin', headerHTML);

}
