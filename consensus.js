import {tmURL, nodeURL, addDetails} from './common.js';

async function buildValidatorAddressArray(validators, tmValMap) {
    function bytesToHex(bytes) {
        return Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    const result = [];
    for (let i = 0; i < validators.length; i++) {
        let val = validators[i];
        const v = {};
        const consPubKey = atob(val?.consensus_pubkey?.key);
        let bytes = new Uint8Array(consPubKey.length);
        for (let j = 0; j < consPubKey.length; j++) {
            bytes[j] = consPubKey.charCodeAt(j);
        }
        // const bytesHash = await window.crypto.subtle.digest('SHA-256', bytes);
        // const addr = bytesHash.slice(0,20);
        // const addrArray = new Uint8Array(addr);
        // const addrHex =  bytesToHex(addrArray).toUpperCase();
        v.pub_key = val.consensus_pubkey.key;
        v.operator_address = val.operator_address;
        v.moniker = val.description.moniker;
        v.consenus_addr_hex = tmValMap[v.pub_key];

        // v.consensus_addr_bech32 = encode("zetavalcons", convertbits(addrArray, 8, 5, true), encodings.BECH32);
        result.push(v);
    }
    return result;
}

async function consensusState() {
    console.log("hello");
    const div = document.getElementById('consensus-state');
    const p1 = await fetch(`${tmURL}/consensus_state`, {method: 'GET'});
    if (!p1.ok) {
        console.log("consensus_state fetch error");
        return;
    }
    const data = await p1.json();
    console.log("consensus-state", data);
    const proposerIndex = data?.result?.round_state?.proposer?.index;

    // const p2 = await fetch(`${tmURL}/dump_consensus_state`, {method: 'GET'});
    // if (!p2.ok) {
    //     console.log("dump_consensus_state fetch error");
    //     return;
    // }
    // const data2 = await p2.json();
    // console.log("dump_state", data2);

    const p3 = await fetch(`${nodeURL}/cosmos/staking/v1beta1/validators`, {method: 'GET'});
    if (!p3.ok) {
        console.log("staking validators fetch error");
        return;
    }
    const data3 = await p3.json();
    console.log(data3);

    let resource = `${tmURL}/validators?per_page=200`;
    let p4 = await fetch(resource, {method: 'GET',});
    let data4 = await p4.json();
    const tmVals = data4?.result?.validators;
    const tmValMap = {};
    for (let i = 0; i < tmVals.length; i++) {
        tmValMap[tmVals[i].pub_key.value] = tmVals[i].address;
    }
    console.log(tmValMap);
    console.log("tmVals", tmVals);
    let totalVP = 0;
    for (let i = 0; i < tmVals.length; i++) {
        totalVP += parseInt(tmVals[i].voting_power);
    }
    console.log("total voting power", totalVP);
    console.log("data3.validators", data3?.validators);

    const vals = await buildValidatorAddressArray(data3?.validators, tmValMap);
    console.log(vals);

    const sortedVals = [];
    for (let i = 0; i < tmVals.length; i++) {
        console.log("tmVals[i].address", tmVals[i].address);

        for (let j = 0; j <vals.length; j++) {
            const val = vals[j];
            // console.log("val.consenus_addr_hex", val.consenus_addr_hex);
            if (val.consenus_addr_hex === tmVals[i].address) {
                sortedVals.push(val.moniker);
                break;
            }
        }
    }
    console.log("sortedVals", sortedVals);

    const roundState = data?.result?.round_state;
    div.appendChild(addDetails(`${roundState["height/round/step"]}`, JSON.stringify(roundState, null, 2)));

    const regex = /{(.*):(.*)}/;
    for (let i = 0; i < roundState?.height_vote_set.length; i++) {
        const voteSet = roundState?.height_vote_set[i];
        // console.log(voteSet);
        const pv = voteSet?.prevotes;
        const pc = voteSet?.precommits;
        const round = voteSet?.round;
        console.log("round", round);
        // console.log("prevotes", pv);
        // console.log("precommits", pc);
        const prevotesBitArray = voteSet?.prevotes_bit_array;
        // div.appendChild(addDetails(`prevotes_bit_array`, prevotesBitArray));
        const prevotes = prevotesBitArray.match(regex)[2];
        const [prevoteMonikers, pvVP] = bitsToMonikers(prevotes, tmVals, data3?.validators);

        const apv = annotate_votes(pv, sortedVals);
        // console.log("apv", apv);
        const apc = annotate_votes(pc, sortedVals);

        const precommitBitArray = voteSet?.precommits_bit_array;
        const precommits = precommitBitArray.match(regex)[2];
        const [precommitMonikers, pcVP] = bitsToMonikers(precommits, tmVals, data3?.validators);
        div.appendChild(addDetails(`round ${voteSet.round} prevotes nil-voter monikers `+`prevotes nil-voter voting power ${pvVP}; ${pvVP / totalVP * 100}%`, `${apv.join('\n')}`));
        // div.appendChild(addDetails(`prevotes nil-voter voting power ${pvVP}; ${pvVP / totalVP * 100}%`, ""));
        div.appendChild(addDetails(`round ${voteSet.round} precommits nil-voter monikers `+`precommits nil-voter voting power ${pcVP}; ${pcVP / totalVP * 100}%`, `${apc.join('\n')}`));
        // div.appendChild(addDetails(`precommits nil-voter voting power ${pcVP}; ${pcVP / totalVP * 100}%`, ""));
    }
}

// annotate the votes with monikers; votes are arrays of things like this
//     "Vote{0:330F77EB744F 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) 000000000000 F6C79E13E2C0 @ 2023-10-24T15:52:57.104726171Z}",
//     "Vote{1:76DB9660002D 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) B24FF10CC94D 3A86182164C8 @ 2023-10-24T15:52:57.565323198Z}",
//     "Vote{2:AF31318E7245 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) 000000000000 60C2E9D485EE @ 2023-10-24T15:52:57.154497833Z}",
//     "Vote{3:40971601D676 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) B24FF10CC94D 36D8B3DB1593 @ 2023-10-24T15:52:57.230847226Z}",
//     "nil-Vote",
// -------------
// 000000000000 hash is the real nil vote in consensus; B24FF10CC94D is a vote on that block; nil-Vote is missing vote
function annotate_votes(votes, monikers) {
    let results = [];
    for (let i = 0; i < votes.length; i++) {
        let v = {};
        const vote = votes[i];
        console.log("moniker", monikers[i]);
        // test for nil vote
        if (vote.includes("nil-Vote")) {
            console.log("nil vote");
                results.push(`missed vote                       ${monikers[i]}`);
        }

        // extract the 000000000000 hash
        const regex = /Vote{.*:.*\/.*\/.*\(.*\) (.*?) .* @/;
        const m = vote.match(regex);
        if (m) {
            const hash = m[1];
            console.log(hash);
            if (hash === "000000000000") {
                results.push(`nil vote:                         ${monikers[i]}`);
            } else {
                results.push(`voted:                            ${monikers[i]}`);
            }
        }

    }
    return results;
}
// annotate_votes(["Vote{0:330F77EB744F 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) 000000000000 F6C79E13E2C0 @ 2023-10-24T15:52:57.104726171Z}","Vote{1:76DB9660002D 2172953/00/SIGNED_MSG_TYPE_PREVOTE(Prevote) B24FF10CC94D 3A86182164C8 @ 2023-10-24T15:52:57.565323198Z}", "nil-Vote"]);


await consensusState();


// input: xxx_xx_; returns monikers for the _ bits
function bitsToMonikers(bits, tmVals, validators) {
    const monikers = [];
    let VP = 0;
    for (let i = 0; i < bits.length; i++) {
        if (bits[i] === '_') {
            const pubkey = tmVals[i].pub_key.value;
            for (let j = 0; j < validators.length; j++) {
                if (validators[j].consensus_pubkey.key === pubkey) {
                    monikers.push(validators[j].description.moniker);
                    break;
                }
            }
            VP += parseInt(tmVals[i].voting_power);
        }
    }
    return [monikers, VP];
}
