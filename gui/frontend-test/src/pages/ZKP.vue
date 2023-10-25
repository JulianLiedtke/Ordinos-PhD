<template>
<div>
    <q-btn size="lg" color="primary" @click="test">xy</q-btn>
    <q-btn size="lg" color="primary" @click="test2">asd</q-btn>
</div>
</template>
<script>
import ZKP from "components/ZKP.js";
import Paillier from "components/Paillier.js";
import Between from "components/BetweenAB";
import help from "components/HelpFunctions";
var bigInt = require("big-integer");
import OneOutOf2 from "components/OneOutOf2";
import Range from "components/RangeZKP";

const crypto = require("crypto");

export default {
    

    data() {
        return {


        };
    },
 
    methods:{
        test(){
            

        
            var key =  BigInt(
                "19324514823630781995795919235045908680244760495658422082722211854560963009928980816700996574043546207743854806705283166688902743980060074423695668843488144405838724269877604947200127672960450160635066837743932900927721631958085122958250329660702996433204326625367545126552271263797270934928391393761309734641494916688041438863006234490806140277751601031234249659772027826674125412076705131709649681921679631424955062483270186120903191628819366686866430870597686244796631169365832127712459043522309649340429969887001991652779740930394733732849281057333693155333078854864033007899341974223199608081624523504695901190539"
            );
             var phi =  BigInt(
            "19324514823630781995795919235045908680244760495658422082722211854560963009928980816700996574043546207743854806705283166688902743980060074423695668843488144405838724269877604947200127672960450160635066837743932900927721631958085122958250329660702996433204326625367545126552271263797270934928391393761309734641213501495559522298851949944533528794362680273247435192567406958928672117169110467306685372209738378784151032174851519921051430279992486499658434571741077652818494565326231094268130094507627345415430013090826907609990317181629447282235588190201089849370398434457874876446583118339603663324211131498829143905760"
            );
            var r1 = ZKP.randomBigInt(1024);
            var r2 = ZKP.randomBigInt(1024);
            var r3 = ZKP.randomBigInt(1024);
            
            
            var r =[r1,r2,r3] 

            var choices = [1,1,0]; 

            var ciphertext1 = Paillier.encrypt(key, choices[0], r1);
            var ciphertext2 = Paillier.encrypt(key, choices[1], r2);
            var ciphertext3 = Paillier.encrypt(key, choices[2], r3);
            
            var ciphers = [ciphertext1,ciphertext2,ciphertext3]
            
            var randomProofNumbers= []

            for (var i = 0; i < 3; i++) {
                var tmp_random = help.getRandomNumber(
                    1024,
                    key
                ); // Get random number
                randomProofNumbers.push(tmp_random); // save random number
            }
            
            console.log("proof start")
            
            //var proof = Between.proof_BetweenAB(1, 3, key, choices, ciphers, r, 1, 1024) // proof 6 nur im audit
            console.log("cipher ", ciphertext1)
            var proof1 = OneOutOf2.proof_1OutOf2(1,0,key,ciphertext1,r1,randomProofNumbers,"1",1024)
            console.log("proof ", proof1)
            // var proof2 = OneOutOf2.proof_1OutOf2(0,1,key,ciphertext2,r2,randomProofNumbers,"psijhbf534ß98dsf",1024)
            // var proof3 = OneOutOf2.proof_1OutOf2(0,1,key,ciphertext3,r3,randomProofNumbers,"psijhbf534ß98dsf",1024)
            //var proof4 = Range.proof_Range(1, 3, key, choices, ciphers, r, "1", 1024)
            
            
            // proof4[2].forEach(p => {
            //     ciphers.push(p)
            // });
            
            //var erg = Between.verify_BetweenAB( proof[7],proof[8], key, ciphers, proof[0], proof[1], proof[2], proof[3], proof[4], proof[5], 1) //Reihenfolge 7,8 wichtig
            var erg1 = OneOutOf2.verify_1OutOf2(1,0,key,ciphertext1,proof1[0],proof1[1],proof1[2],proof1[3],proof1[4],proof1[5],"1")
            // var erg2 = OneOutOf2.verify_1OutOf2(0,1,key,ciphertext2,proof2[0],proof2[1],proof2[2],proof2[3],proof2[4],proof2[5],"psijhbf534ß98dsf")
            // var erg3 = OneOutOf2.verify_1OutOf2(0,1,key,ciphertext3,proof3[0],proof3[1],proof3[2],proof3[3],proof3[4],proof3[5],"psijhbf534ß98dsf")
            //var erg4 = Range.verify_Range(3,proof4[0],ciphers,key,"1")
            
            console.log("erg1: " + erg1)
            // console.log("erg2: " + erg2)
            // console.log("erg3: " + erg3)
            //console.log("erg4: " + erg4)
            
        },
        test2(){
            // var voterId = "1"
            // var hash = crypto.createHash("sha512");
            //     hash.update(
            //         this.text2Binary(voterId)
            //     );

            //     var hex = hash.digest("hex");
                
            //     var s = help.hexTobigInt(hex);
                        
            //     console.log(s)        
                        
        
}
    }
}    
</script>
<style>

</style>